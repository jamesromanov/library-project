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
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('add')
  @ApiOperation({
    summary: "kitob qo'shish faqat adminlar uchun",
    description: "kitob qo'shish rasmi bilan faqat adminlar uchun",
  })
  @ApiCreatedResponse({ description: "Muvaffaqiyatli qo'shildi" })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.booksService.create(createBookDto, image);
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
