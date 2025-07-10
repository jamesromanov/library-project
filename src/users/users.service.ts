import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserAuthDto } from './dto/user-login.auth.dto';
import { RedisService } from 'src/redis/redis.service';
import { Role, User } from 'generated/prisma';
import { AdminRole } from 'src/admin-auth/admin.role';
import * as bcyrpt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UserQueryDto } from './dto/user.query.dto';
import { CustomExpress } from 'src/global.type';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    if (createUserDto.role === AdminRole.ADMIN)
      throw new BadRequestException('foydalanuvchi roli USER bolishi kerak');
    const userExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email, active: true },
    });
    if (userExists)
      throw new BadRequestException('Bu foydalanuchi oldin royxatadan o`tgan');

    createUserDto.password = await bcyrpt.hash(createUserDto.password, 12);
    await this.prisma.user.create({ data: createUserDto });
    return "Muvaffaqiyatli qo'shildi";
  }
  async login(loginAuthDto: LoginUserAuthDto) {
    const { email, password } = loginAuthDto;
    let user: User;
    const userCache = await this.redis.get(`user:${email}`);

    const userExists = await this.prisma.user.findUnique({
      where: { email, active: true },
    });
    if (!userExists || userExists.role !== AdminRole.USER)
      throw new NotFoundException('Parol yoki email xato');

    if (userCache) user = JSON.parse(userCache);
    else user = userExists;

    const comparePassword = await bcyrpt.compare(password, user.password);
    if (!comparePassword) throw new NotFoundException('Parol yoki email xato');

    await this.redis.set(`user:${email}`, user, 60);

    const payload = {
      id: user.id,
      role: user.role,
    };

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.REFRESH_USER_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_USER_TOKEN_EXP,
    });

    const acceesToken = await this.jwt.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: process.env.ACCESS_TOKEN_EXP,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { refreshToken, acceesToken };
  }
  // User log out
  async logout(req: CustomExpress, res: Response) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) throw new NotFoundException('Token topilmadi');

    try {
      const validateToken = await this.jwt.verifyAsync(accessToken, {
        secret: process.env.ACCESS_USER_TOKEN_KEY,
      });

      const userExists = await this.prisma.user.findUnique({
        where: { id: validateToken.id },
      });
      if (!userExists) throw new NotFoundException('Token topilmadi');
      if (userExists.id !== validateToken.id)
        throw new UnauthorizedException('Token yaroqsiz');
      await this.update(userExists.id, { refreshToken: null });
      await this.addToTheblaclList(accessToken);

      return 'Muvaffaqiyatli chiqildi';
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async addToTheblaclList(token: string) {
    const time = this.jwt.decode(token) as any;
    const now = Date.now();
    return await this.redis.set(`blacklist:token:${token}`, token, now - time);
  }
  async findAll(query: UserQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy yoki nolga teng bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    const queryOptions = {
      skip: +offset,
      take: +limit,
    };
    let users: any[];
    let usersCount: number;
    const cacheUsers = await this.redis.get(`users:page:${page}:${limit}`);
    const cacheUsersCount = await this.redis.get(`totalUsers:count`);

    console.log(cacheUsers, cacheUsersCount);

    const [count, usersAll] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        ...queryOptions,
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      }),
    ]);
    if (cacheUsers && cacheUsersCount) {
      users = JSON.parse(cacheUsers);
      usersCount = +cacheUsersCount;
    } else {
      users = usersAll;
      usersCount = count;
    }

    if (usersAll.length > 0 && count >= 1) {
      await this.redis.set(`users:page:${page}:${limit}`, usersAll, 60);
      await this.redis.set(`totalUsers:count`, count, 60);
    }

    const totalPages = Math.ceil(usersCount / limit);

    return {
      currentPage: +page,
      totalPages,
      hasNextPage: page < totalPages,
      totalDataCount: usersCount,
      data: users,
    };
  }

  async findOne(id: string, active?: boolean) {
    const userCache = await this.redis.get(`user:id:${id}`);
    if (userCache) return JSON.parse(userCache);
    const userExists = await this.prisma.user.findUnique({
      where: { id, active: active },
    });
    if (!userExists)
      throw new NotFoundException('Bu iddagi foydalanuvchi topilmadi');
    await this.redis.set(`user:id:${id}`, userExists, 60);
    return userExists;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExists = await this.findOne(id, true);
    if (updateUserDto.password)
      updateUserDto.password = await bcyrpt.hash(updateUserDto.password, 12);
    const updatedUser = await this.prisma.user.update({
      where: { id: userExists.id },
      data: updateUserDto,
    });
    await this.redis.del(`user:id:${id}`);
    return updatedUser;
  }

  async remove(id: string) {
    const userExists = await this.findOne(id, true);
    await this.update(userExists.id, { active: false });
    return "Muvaffaqiyatli o'chirildi";
  }

  async getMe(req: CustomExpress) {
    const { user } = req;
    if (!user) throw new UnauthorizedException('Royxatdan otilmagan');
    const userExists = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    return userExists;
  }
}
