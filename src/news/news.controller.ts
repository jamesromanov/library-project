import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BooleanValidationPipe } from 'src/books/dto/active.validation.pipe';
import { Languages } from 'src/books/languages';
import { QueryDto } from './query.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOperation({
    summary: 'yangilik qoshish (adminlar uchun)',
    description: 'yangilik qoshish faqat adminlar uchun',
  })
  @ApiCreatedResponse({ description: "Muvaffaqiyatli qo'shildi" })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('add')
  create(
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    createNewsDto.active = new BooleanValidationPipe().transform(
      createNewsDto.active.toString(),
      { type: 'body', data: 'active' },
    ) as boolean;
    return this.newsService.create(createNewsDto, image);
  }

  @ApiOperation({
    summary: 'barcha yangiliklarni olish (adminlar uchun)',
    description: 'yangiliklarni olish pagination orqali adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffiqaytli olindi' })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiBadRequestResponse({ description: 'Xato malumot kiritildi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'page', type: 'number' })
  @ApiQuery({
    name: 'language',
    type: 'enum',
    enum: Languages,
    required: false,
  })
  @Get('get')
  findAll(@Query() query: QueryDto) {
    return this.newsService.findAll(query);
  }

  @ApiOperation({
    summary: 'yangilikni id orqali olish (adminlar uchun)',
    description: 'yangiliklarni id orqali olish adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffiqaytli olindi' })
  @ApiBadRequestResponse({ description: 'Id xato kiritildi' })
  @ApiNotFoundResponse({ description: "Hech qanday ma'lumot topilmadi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @ApiOperation({
    summary: 'yangiliklarni yangilash (adminlar uchun)',
    description: 'yangiliklarni id orqali yangilash adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffatiqyatli yangilandi' })
  @ApiBadRequestResponse({ description: 'Id xato kiritildi' })
  @ApiNotFoundResponse({ description: "Hech qanday ma'lumot topilmadi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateNewsDto })
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    updateNewsDto.active =
      updateNewsDto.active !== undefined
        ? new BooleanValidationPipe().transform(
            updateNewsDto.active.toString(),
            {
              type: 'body',
              data: 'active',
            },
          )
        : undefined;
    return this.newsService.update(id, updateNewsDto, image);
  }

  @ApiOperation({
    summary: 'yangiliklarni ochirish (adminlar uchun)',
    description: 'yangilikarni id orqali ochirish adminlar uchun',
  })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiOkResponse({ description: 'Muvaffaqiyatli ochirildi' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  @Get('get/all')
  @ApiOperation({
    summary: 'yangiliklarni olish (adminlar uchun)',
    description:
      'barcha kitoblarni olish pagination orqali adminlar uchun adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'page', type: 'string' })
  @ApiQuery({
    name: 'language',
    type: 'enum',
    enum: Languages,
    required: false,
  })
  getALlNews(@Query() query: QueryDto) {
    return this.newsService.getAllnews(query);
  }
}
