import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'generated/prisma';
import { CustomExpress } from 'src/global.type';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}
  async create(createLikeDto: CreateLikeDto, req: CustomExpress) {
    const likesExists = await this.prisma.like.findMany({
      where: { userId: req.user.id, bookId: createLikeDto.bookId },
    });
    if (likesExists.length > 0)
      throw new BadRequestException('Kitobga avval like bosilgan');
    const userExists = await this.prisma.user.findUnique({
      where: { id: req.user.id, active: true },
    });
    if (!userExists)
      throw new NotFoundException('Berilgan iddagi foydalanuvchi topilmadi');
    const bookExists = await this.prisma.book.findUnique({
      where: { id: createLikeDto.bookId, active: true },
    });
    if (!bookExists)
      throw new NotFoundException('Berilgan iddagi kitob topilmadi');

    return await this.prisma.like.create({
      data: { ...createLikeDto, userId: userExists.id },
    });
  }
  async getLikes(req: CustomExpress) {
    const userId = req.user.id;
    const likesCache = await this.redis.get(`likes:all:${userId}`);
    if (likesCache) return JSON.parse(likesCache);
    const likes = await this.prisma.like.findMany({
      where: { userId },
      include: {
        book: true,
      },
    });
    if (likes.length === 0)
      throw new NotFoundException('Hech qanday likelar topilmadi');
    await this.redis.set(`likes:all:${userId}`, likes, 30);
    return likes;
  }

  async remove(id: string) {
    const likeExists = await this.prisma.like.findUnique({ where: { id } });
    if (!likeExists) throw new BadRequestException('Oldin like bosilmagan');

    return await this.prisma.like.delete({ where: { id } });
  }
}
