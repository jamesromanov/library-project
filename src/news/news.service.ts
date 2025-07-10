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
import MsearchApi from '@elastic/elasticsearch/lib/api/api/msearch';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private redis: RedisService,
  ) {}

  async create(
    createNewsDto: CreateNewsDto,
    images: Express.Multer.File[],
    thumbnail: Express.Multer.File,
  ) {
    const active = createNewsDto.active == true ? true : false;

    const imgUrls = await Promise.all([
      await Promise.all(
        images.map((e) => {
          return new Promise<string>(async (res, rej) => {
            this.cloudinary
              .uploadImage(e)
              .then((data) => {
                res(data.secure_url);
              })
              .catch(() => {
                rej('Rasm yuklashda xatolik');
              });
          });
        }),
      ),
      new Promise<string>(async (res, rej) => {
        this.cloudinary
          .uploadImage(thumbnail[0])
          .then(async (data) => {
            res(data.secure_url);
          })
          .catch((err) => {
            console.log(err);
            throw new BadRequestException('Muqova yulashda xatolik');
          });
      }),
    ]);

    await this.prisma.new.create({
      data: {
        ...createNewsDto,
        active,
        images: imgUrls[0],
        thumbnail: imgUrls[1],
      },
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

  // UPDATE newss only for admins
  async update(
    id: string,
    updateNewsDto: UpdateNewsDto,
    images?: Express.Multer.File[],
    thumbnail?: Express.Multer.File,
  ) {
    const newExists = await this.findOne(id);
    updateNewsDto.context = updateNewsDto.context || undefined;
    updateNewsDto.language = updateNewsDto.language || undefined;
    updateNewsDto.publication_date =
      updateNewsDto.publication_date || undefined;
    updateNewsDto.source = updateNewsDto.source || undefined;
    updateNewsDto.title = updateNewsDto.title || undefined;

    const imgUrls = images?.length
      ? await Promise.all(
          images.map((img) => {
            return new Promise<string>(async (res, rej) => {
              this.cloudinary
                .uploadImage(img)
                .then((data) => {
                  res(data.secure_url);
                })
                .catch(() => {
                  rej('Rasm yuklashda xatolik');
                });
            });
          }),
        )
      : undefined;
    const thumbNail =
      thumbnail !== undefined
        ? await this.cloudinary
            .uploadImage(thumbnail[0])
            .then(async (data) => {
              return data.secure_url;
            })
            .catch((err) => {
              console.log(err);
              throw new BadRequestException('Muqova yulashda xatolik');
            })
        : undefined;

    const updatedNew = await this.prisma.new.update({
      where: { id: newExists.id },
      data: {
        ...updateNewsDto,
        images: imgUrls,
        thumbnail: thumbNail,
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
