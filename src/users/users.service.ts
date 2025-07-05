import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private readonly prism: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    if (createUserDto.role === AdminRole.ADMIN)
      throw new BadRequestException('foydalanuvchi roli USER bolishi kerak');
    await this.prism.user.create({ data: createUserDto });
    return "Muvaffaqiyatli qo'shildi";
  }
  async login(loginAuthDto: LoginUserAuthDto, req: Request) {
    const { email, password } = loginAuthDto;
    let user: User;
    const userCache = await this.redis.get(`user:${email}`);

    const userExists = await this.prism.user.findUnique({ where: { email } });
    if (!userExists || userExists.role !== AdminRole.USER)
      throw new NotFoundException('Parol yoki email xato');

    if (userCache) user = JSON.parse(userCache);
    else user = userExists;

    await this.redis.set(`user:${email}`, user, 60);

    const payload = {
      id: user.id,
      role: user.role,
    };

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.REFRESH_USER_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_USER_TOKEN_EXP,
    });

    const comparePassword = await bcyrpt.compare(password, user.password);
    if (!comparePassword) throw new NotFoundException('Parol yoki email xato');
  }
  findAll() {
    return `This action returns all users`;
  }
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
