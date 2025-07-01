import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Languages } from 'src/books/languages';
import { QueryDto } from './dto/query,dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @ApiOperation({
    summary: "zayavka qo'shish",
    description: "zayavka qo'shish rasmi bilan faqat adminlar uchun",
  })
  @ApiCreatedResponse({ description: "Muvaffaqiyatli qo'shildi" })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Post('add')
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @ApiOperation({
    summary: 'barcha zayavkani olish',
    description:
      'barcha kitoblarni olish pagination orqali adminlar uchun adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'page', type: 'string' })
  @Get('all')
  findAll(@Query() query: QueryDto) {
    return this.applicationsService.findAll(query);
  }

  @ApiOperation({
    summary: 'zayavkani id orqali olish',
    description: 'zayavka id orqali olish adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffiqaytli olindi' })
  @ApiBadRequestResponse({ description: 'Id xato kiritildi' })
  @ApiNotFoundResponse({ description: "Hech qanday ma'lumot topilmadi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @ApiOperation({
    summary: 'applucation yangilash',
    description: 'application id orqali yangilash adminlar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffatiqyatli yangilandi' })
  @ApiBadRequestResponse({ description: 'Id xato kiritildi' })
  @ApiNotFoundResponse({ description: "Hech qanday ma'lumot topilmadi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @ApiOperation({
    summary: 'zayavkalarni ochirish',
    description: 'zayavkalarni id orqali ochirish',
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
    return this.applicationsService.remove(id);
  }
}
