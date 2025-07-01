import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { QueryDto } from './dto/query,dto';

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
    return `This action returns all applications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} application`;
  }

  update(id: number, updateApplicationDto: UpdateApplicationDto) {
    return `This action updates a #${id} application`;
  }

  remove(id: number) {
    return `This action removes a #${id} application`;
  }
}
