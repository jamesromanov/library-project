import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryDto } from './dto/query.dto';
import { RedisService } from 'src/redis/redis.service';
import { Book } from 'generated/prisma';
import { of } from 'rxjs';
import { listenerCount } from 'process';
import { compareSync } from 'bcrypt';

@Injectable()
export class BooksService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
    private redis: RedisService,
  ) {}
  // BOOK create
  async create(createBookDto: CreateBookDto, image: Express.Multer.File) {
    createBookDto.pages = Number(createBookDto.pages);
    createBookDto.price = Number(createBookDto.price);
    createBookDto.publishedYear = Number(createBookDto.publishedYear);
    await this.cloudinaryService
      .uploadImage(image)
      .then(async (data) => {
        await this.prisma.book.create({
          data: { ...createBookDto, image: data.secure_url },
        });
      })
      .catch(() => {
        throw new BadRequestException('Yaroqsiz file turi');
      });
    return "Muvaffaqiyatli qo'shildi";
  }
  // FIND all methond by pagination
  async findAll(query: QueryDto) {
    const { limit, page } = query;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    let books: any[];
    let booksCount: number;
    const cacheBooks = await this.redis.get(`books:page:${page}`);
    const cacheBooksCount = await this.redis.get(`totalBooks:count`);

    const [count, booksAll] = await this.prisma.$transaction([
      this.prisma.book.count({
        select: {
          _all: true,
        },
      }),
      this.prisma.book.findMany({
        skip: +offset,
        take: +limit,
      }),
    ]);
    if (cacheBooks && cacheBooksCount) {
      books = JSON.parse(cacheBooks);
      booksCount = +cacheBooksCount;
    } else {
      books = booksAll;
      booksCount = count._all;
    }

    if (booksAll.length && count._all > 1) {
      await this.redis.set(`books:page:${page}`, booksAll);
      await this.redis.set(`totalBooks:count`, count._all);
    }

    const totalPages = Math.ceil(booksCount / limit);

    return {
      currentPage: +page,
      totalPages,
      hasNextPage: page < totalPages,
      totalDataCount: booksCount,
      data: books,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
