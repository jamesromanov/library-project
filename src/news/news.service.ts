import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RedisService } from 'src/redis/redis.service';
import { QueryDto } from './query.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private redis: RedisService,
  ) {}
  async create(createNewsDto: CreateNewsDto, image: Express.Multer.File) {
    const active = createNewsDto.active == true ? true : false;
    const imageUrl = await this.cloudinary
      .uploadImage(image)
      .then((data) => {
        return data.secure_url;
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException('Rasm yuklashda xatolik');
      });

    const New = await this.prisma.new.create({
      data: { ...createNewsDto, active, image: imageUrl },
    });

    return "Muvaffaqiyatli qo'shildi";
  }

  async findAll(query: QueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const language = query.language;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy yoki nolga bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    const queryOptions = {
      skip: +offset,
      take: +limit,
      where: { language },
    };
    let news: any[];
    let newsCount: number;
    const cacheNews = await this.redis.get(
      `news:page:${page}:${limit}:${language}`,
    );
    const cacheNewsCount = await this.redis.get(`totalNews:count:${language}`);

    console.log(cacheNews, cacheNewsCount);
    const [count, newsAll] = await this.prisma.$transaction([
      this.prisma.new.count({ where: { language } }),
      this.prisma.new.findMany({
        ...queryOptions,
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      }),
    ]);
    if (cacheNews && cacheNewsCount) {
      news = JSON.parse(cacheNews);
      newsCount = +cacheNewsCount;
    } else {
      news = newsAll;
      newsCount = count;
    }

    if (newsAll.length > 0 && count >= 1) {
      await this.redis.set(
        `news:page:${page}:${limit}:${language}`,
        newsAll,
        60,
      );
      await this.redis.set(`totalNews:count:${language}`, count, 60);
    }

    const totalPages = Math.ceil(newsCount / limit);

    return {
      currentPage: +page,
      totalPages,
      hasNextPage: page < totalPages,
      totalDataCount: newsCount,
      data: news,
    };
  }

  async findOne(id: string, active?: boolean) {
    const newCache = await this.redis.get(`new:id:${id}`);
    console.log(newCache);
    if (newCache) return JSON.parse(newCache);

    const newExists = await this.prisma.new.findUnique({
      where: { id, active: active || true },
    });
    if (!newExists) throw new NotFoundException('Bu iddagi yangilik topilmadi');

    await this.redis.set(`new:id:${id}`, newExists, 60);
    return newExists;
  }

  // UPDATE news only for admins
  async update(
    id: string,
    updateNewsDto: UpdateNewsDto,
    image?: Express.Multer.File,
  ) {
    const newExists = await this.findOne(id);
    updateNewsDto.context = updateNewsDto.context || undefined;
    updateNewsDto.language = updateNewsDto.language || undefined;
    updateNewsDto.publication_date =
      updateNewsDto.publication_date || undefined;
    updateNewsDto.source = updateNewsDto.source || undefined;
    updateNewsDto.title = updateNewsDto.title || undefined;

    const imgUrl =
      image !== undefined
        ? await this.cloudinary
            .uploadImage(image)
            .then(async (data) => {
              return data.secure_url;
            })
            .catch((err) => {
              console.log(err);
              throw new BadRequestException('Rasm yuklashda xatolik');
            })
        : undefined;

    const updatedNew = await this.prisma.new.update({
      where: { id: newExists.id },
      data: {
        ...updateNewsDto,
        image: imgUrl,
      },
    });
    await this.redis.del(`new:id:${id}`);
    return updatedNew;
  }

  async remove(id: string) {
    const bookExists = await this.findOne(id);
    await this.update(bookExists.id, { active: false });

    await this.redis.del(`new:id:${id}`);

    return "Muvaffaqiyatli o'chirildi";
  }
  // GET ALL NEWS for users
  async getAllnews(query: QueryDto) {
    console.log(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const language = query.language;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy yoki nolga teng bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    const queryOptions = {
      skip: +offset,
      take: +limit,
      where: { language, active: true },
    };
    let news: any[];
    let newsCount: number;
    const cacheNews = await this.redis.get(
      `news:page:${page}:${limit}:${language}:all`,
    );
    const cacheNewsCount = await this.redis.get(
      `totalNews:count:${language}:all`,
    );

    const [count, newsAll] = await this.prisma.$transaction([
      this.prisma.new.count({ where: { language, active: true } }),
      this.prisma.new.findMany({
        ...queryOptions,
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      }),
    ]);
    if (cacheNews && cacheNewsCount) {
      news = JSON.parse(cacheNews);
      newsCount = +cacheNewsCount;
    } else {
      news = newsAll;
      newsCount = count;
    }

    if (newsAll.length > 0 && count >= 1) {
      await this.redis.set(
        `news:page:${page}:${limit}:${language}:all`,
        newsAll,
        60,
      );
      await this.redis.set(`totalNews:count:${language}:all`, count, 60);
    }

    const totalPages = Math.ceil(newsCount / limit);

    return {
      currentPage: +page,
      totalPages,
      hasNextPage: page < totalPages,
      totalDataCount: newsCount,
      data: news,
    };
  }
}
