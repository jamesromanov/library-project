import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryDto } from './dto/query.dto';
import { Book, RedisService } from 'src/redis/redis.service';

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
    const book = await this.cloudinaryService
      .uploadImage(image)
      .then(async (data) => {
        return await this.prisma.book.create({
          data: {
            ...createBookDto,
            image: data.secure_url,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException('Rasm yoki kitob yaratishda   xatolik');
      });

    if (createBookDto.active === true)
      await this.addBookSAutocomplete(book as any);

    return "Muvaffaqiyatli qo'shildi";
  }
  // FIND all methond by pagination
  async findAll(query: QueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const language = query.language;
    const category = query.category;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    const queryOptions = {
      skip: +offset,
      take: +limit,
      where: { language, category },
    };
    let books: any[];
    let booksCount: number;
    const cacheBooks = await this.redis.get(
      `books:page:${page}:${limit}:${language}:${category}`,
    );
    const cacheBooksCount = await this.redis.get(
      `totalBooks:count:${language}:${category}`,
    );

    console.log(cacheBooks, cacheBooksCount);

    const [count, booksAll] = await this.prisma.$transaction([
      this.prisma.book.count({ where: { language, category } }),
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
        `books:page:${page}:${limit}:${language}:${category}`,
        booksAll,
        60,
      );
      await this.redis.set(
        `totalBooks:count:${language}:${category}`,
        count,
        60,
      );
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

  async findOne(id: string, active?: boolean) {
    const bookCache = await this.redis.get(`book:id:${id}`);
    console.log(bookCache, 'bookcache');
    if (bookCache) return JSON.parse(bookCache);
    const bookExists = await this.prisma.book.findUnique({
      where: { id, active: active || true },
    });

    if (!bookExists) throw new NotFoundException('Bu id dagi kitob topilmadi.');
    await this.redis.set(`book:id:${id}`, bookExists, 60);
    return bookExists;
  }

  // BOOK update
  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    image?: Express.Multer.File,
  ) {
    const bookExists = await this.findOne(id);
    updateBookDto.pages = Number(updateBookDto.pages) || undefined;
    updateBookDto.author = updateBookDto.author || undefined;
    updateBookDto.description = updateBookDto.description || undefined;
    updateBookDto.format = updateBookDto.format || undefined;
    updateBookDto.language = updateBookDto.language || undefined;
    updateBookDto.pages = Number(updateBookDto.pages) || undefined;
    updateBookDto.price = Number(updateBookDto.price) || undefined;
    updateBookDto.publishedYear =
      Number(updateBookDto.publishedYear) || undefined;
    updateBookDto.title = updateBookDto.title || undefined;

    const imgUrl =
      image !== undefined
        ? await this.cloudinaryService
            .uploadImage(image)
            .then(async (data) => {
              return data.secure_url;
            })
            .catch((err) => {
              console.log(err);
              throw new BadRequestException('Rasm yuklashda xatolik');
            })
        : undefined;

    const updatedBook = await this.prisma.book.update({
      where: { id: bookExists.id },
      data: {
        ...updateBookDto,
        image: imgUrl,
      },
    });
    await this.addBookSAutocomplete(updateBookDto as any);
    await this.redis.del(`book:id:${id}`);
    return updatedBook;
  }
  // BOOK delete soft delete
  async remove(id: string) {
    const bookExists = await this.findOne(id, true);
    await this.update(bookExists.id, { active: false });
    await this.redis.del(`book:id:${id}`);

    return "Muvaffaqiyatli o'chirildi";
  }

  // BOOK get all books for anyone without token
  async getAllBooks(query: QueryDto) {
    console.log(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const language = query.language;
    const category = query.category;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    const queryOptions = {
      skip: +offset,
      take: +limit,
      where: { language, category, active: true },
    };
    let books: any[];
    let booksCount: number;
    const cacheBooks = await this.redis.get(
      `books:page:${page}:${limit}:${language}:${category}:all`,
    );
    const cacheBooksCount = await this.redis.get(
      `totalBooks:count:${language}:${category}:all`,
    );

    const [count, booksAll] = await this.prisma.$transaction([
      this.prisma.book.count({ where: { language, category, active: true } }),
      this.prisma.book.findMany({
        ...queryOptions,
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      }),
    ]);
    console.log(booksAll);
    if (cacheBooks && cacheBooksCount) {
      books = JSON.parse(cacheBooks);
      booksCount = +cacheBooksCount;
    } else {
      books = booksAll;
      booksCount = count;
    }

    if (booksAll.length > 0 && count >= 1) {
      await this.redis.set(
        `books:page:${page}:${limit}:${language}:${category}:all`,
        booksAll,
        60,
      );
      await this.redis.set(
        `totalBooks:count:${language}:${category}:all`,
        count,
        60,
      );
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
  async getBooksByTitle(query: { search: string }) {
    const data = await this.redis.getFroAutocomplete(query.search);
    return data;
  }

  async addBookSAutocomplete(data: Book) {
    return await this.redis.addForAutoComplete(data);
  }
}
