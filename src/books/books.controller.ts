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
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  ApiBadRequestResponse,
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
import { QueryDto } from './dto/query.dto';
import { Languages } from 'generated/prisma';

@Controller('admin/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('add')
  @ApiOperation({
    summary: "kitob qo'shish faqat adminlar uchun",
    description:
      "kitob qo'shish rasmi bilan faqat adminlar uchun adminlar uchun",
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
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.booksService.create(createBookDto, image);
  }

  @Get('get')
  @ApiOperation({
    summary: 'barcha kitoblarni olish',
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
  findAll(@Query() query: QueryDto) {
    return this.booksService.findAll(query);
  }
  @ApiOperation({
    summary: 'kitobni id orqali olish',
    description: 'kitoblarni id orqali olish adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffiqaytli olindi' })
  @ApiBadRequestResponse({ description: 'Id xato kiritildi' })
  @ApiNotFoundResponse({ description: "Hech qanday ma'lumot topilmadi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'kitobni yangilash',
    description: 'kitoblarni id orqali yangilash',
  })
  @ApiOkResponse({ description: 'Muvaffatiqyatli yangilandi' })
  @ApiBadRequestResponse({ description: 'Id xato kiritildi' })
  @ApiNotFoundResponse({ description: "Hech qanday ma'lumot topilmadi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.booksService.update(id, updateBookDto, image);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
