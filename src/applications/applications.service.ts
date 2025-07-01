import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { QueryDto } from './dto/query,dto';
import { application } from 'express';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private redis: RedisService,
  ) {}
  async create(createApplicationDto: CreateApplicationDto) {
    const createdApplication = await this.prisma.application.create({
      data: createApplicationDto,
    });
    return createdApplication;
  }

  async findAll(query: QueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `${limit < 1 ? 'Limit' : 'Page'} manfiy bo'lishi mumkin emas.`,
      );
    const offset = (page - 1) * limit;
    const queryOptions = {
      skip: +offset,
      take: +limit,
    };
    let applications: any[];
    let applicationCount: number;
    const cacheApplications = await this.redis.get(
      `applications:page:${page}:${limit}`,
    );
    const cacheApplicationsCount = await this.redis.get(
      `totalApplications:count`,
    );
    console.log(cacheApplications, cacheApplicationsCount);

    const [count, applicationAll] = await this.prisma.$transaction([
      this.prisma.application.count(),
      this.prisma.application.findMany({
        ...queryOptions,
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      }),
    ]);
    if (cacheApplications && cacheApplicationsCount) {
      applications = JSON.parse(cacheApplications);
      applicationCount = +cacheApplicationsCount;
    } else {
      applications = applicationAll;
      applicationCount = count;
    }

    if (applicationAll.length > 0 && count >= 1) {
      await this.redis.set(
        `applications:page:${page}:${limit}`,
        applicationAll,
        60,
      );
      await this.redis.set(`totalApplications:count`, count, 60);
    }

    const totalPages = Math.ceil(applicationCount / limit);

    return {
      currentPage: +page,
      totalPages,
      hasNextPage: page < totalPages,
      totalDataCount: applicationCount,
      data: applications,
    };
  }

  async findOne(id: string) {
    const appCache = await this.redis.get(`application:id:${id}`);
    console.log(appCache, 'bookcache');
    if (appCache) return JSON.parse(appCache);
    const applicationExists = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!applicationExists)
      throw new NotFoundException('Bu id dagi application topilmadi.');
    await this.redis.set(`application:id:${id}`, applicationExists, 60);
    return applicationExists;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    const applicationExists = await this.findOne(id);

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationExists.id },
      data: updateApplicationDto,
    });
    await this.redis.del(`application:id:${id}`);
    return updatedApplication;
  }

  async remove(id: string) {
    const applicationExists = await this.findOne(id);
    await this.update(applicationExists.id, { active: false });
    await this.redis.del(`application:id:${id}`);

    return "Muvaffaqiyatli o'chirildi";
  }
}
