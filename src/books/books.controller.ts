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
  ValidationPipe,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { QueryDto } from './dto/query.dto';
import { Book, Languages } from 'generated/prisma';
import { BooleanValidationPipe } from './dto/active.validation.pipe';
import { reduce } from 'rxjs';
import { IsString } from 'class-validator';
import { Roles } from 'src/guards/roles';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AdminRole } from 'src/admin-auth/admin.role';
import { BookCategories } from './catigories';

export class Data {
  @ApiProperty({ example: 'sasasa' })
  @IsString()
  data: string;
}

@Controller('admin/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth()
  @Post('add')
  @ApiOperation({
    summary: "kitob qo'shish (adminlar uchun)",
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles()
    files: { image: Express.Multer.File; file: Express.Multer.File },
  ) {
    createBookDto.active = new BooleanValidationPipe().transform(
      createBookDto.active.toString(),
      { type: 'body', data: 'active' },
    ) as boolean;
    console.log(files);
    return this.booksService.create(createBookDto, files.image, files.file);
  }
  @ApiOperation({
    summary: 'kitoblarni olish',
    description: 'kitoblarni olish pagination orqali barcha uchun',
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
  @ApiQuery({
    name: 'category',
    type: 'enum',
    enum: BookCategories,
    required: false,
  })
  @Get('getBooks/all')
  ges(@Query() query: QueryDto) {
    return this.booksService.getAllBooks(query);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth()
  @Get('get')
  @ApiOperation({
    summary: 'barcha kitoblarni olish (adminalar uchun)',
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
  @ApiQuery({
    name: 'category',
    type: 'enum',
    enum: BookCategories,
    required: false,
  })
  findAll(@Query() query: QueryDto) {
    return this.booksService.findAll(query);
  }
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'kitobni id orqali olish (adminlar uchun) ',
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: 'kitobni yangilash (adminlar uchun)',
    description: 'kitoblarni id orqali yangilash adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffatiqyatli yangilandi' })
  @ApiBadRequestResponse({ description: 'Id xato kiritildi' })
  @ApiNotFoundResponse({ description: "Hech qanday ma'lumot topilmadi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBookDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body()
    updateBookDto: UpdateBookDto,
    @UploadedFiles()
    files: { image: Express.Multer.File; file: Express.Multer.File },
  ) {
    updateBookDto.active = updateBookDto.active
      ? new BooleanValidationPipe().transform(updateBookDto.active.toString(), {
          type: 'body',
          data: 'active',
        })
      : undefined;
    console.log(updateBookDto.active, 'controller');
    return this.booksService.update(
      id,
      updateBookDto,
      files.image,
      files.image,
    );
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'kitoblani ochirish (adminlar uchun)',
    description: 'kitoblarni id orqali ochirish',
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
    return this.booksService.remove(id);
  }

  @ApiOperation({
    summary: 'kitoblarni nomi orqali olish',
    description: 'kitoblerni nomi orqali qidirish',
  })
  @ApiOkResponse({ description: 'Muvaffiqitayli olindi' })
  @ApiNotFoundResponse({ description: 'Hech qanday kitob qopilmadi' })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get('get/book')
  @ApiQuery({ name: 'search', type: 'string' })
  getBookByTitle(@Query() query: { search: string }) {
    return this.booksService.getBooksByTitle(query);
  }
}
