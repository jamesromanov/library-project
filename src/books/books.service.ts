import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryDto } from './dto/query.dto';
import { RedisService } from 'src/redis/redis.service';
import { Book } from 'generated/prisma';
import { of, take } from 'rxjs';
import { listenerCount, off } from 'process';
import { compareSync } from 'bcrypt';
import { Languages } from './languages';

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
      .catch((err) => {
        console.log(err);
        throw new BadRequestException('Yaroqsiz file turi');
      });
    return "Muvaffaqiyatli qo'shildi";
  }
  // FIND all methond by pagination
  async findAll(query: QueryDto) {
    const { limit, page, language } = query;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    const queryOptions = {
      skip: +offset,
      take: +limit,
      where: { language },
    };
    let books: any[];
    let booksCount: number;
    const cacheBooks = await this.redis.get(
      `books:page:${page}:${limit}:${language}`,
    );
    const cacheBooksCount = await this.redis.get(
      `totalBooks:count:${language}`,
    );

    const [count, booksAll] = await this.prisma.$transaction([
      this.prisma.book.count({ where: { language } }),
      this.prisma.book.findMany({
        ...queryOptions,
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      }),
    ]);
    if (cacheBooks && cacheBooksCount) {
      books = JSON.parse(cacheBooks);
      booksCount = +cacheBooksCount;
    } else {
      books = booksAll;
      booksCount = count;
    }

    if (booksAll.length > 0 && count >= 1) {
      await this.redis.set(
        `books:page:${page}:${limit}:${language}`,
        booksAll,
        60,
      );
      await this.redis.set(`totalBooks:count:${language}`, count, 60);
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
