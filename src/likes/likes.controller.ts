import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CustomExpress } from 'src/global.type';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "like qo'shish",
    description: 'like bosing kitoblar uchun',
  })
  @ApiCreatedResponse({ description: 'Muvaffaqiyatli bosildi' })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Post()
  create(@Body() createLikeDto: CreateLikeDto, @Req() req: CustomExpress) {
    return this.likesService.create(createLikeDto, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'like olib tashlash',
    description: 'kitobdan bosilgan likeni olib tashlash',
  })
  @ApiOkResponse({
    description: 'Muvaffaqiyatli olib tashlandi',
  })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likesService.remove(id);
  }

  @ApiOperation({
    summary: 'likelarni olish',
    description: 'Likelarni olish foydalauvchilar uchun',
  })
  @ApiOkResponse({
    description: 'Muvaffaqiyatli olindi',
  })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki topilmadi' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get('likes')
  getLikes(@Req() req: CustomExpress) {
    return this.likesService.getLikes(req);
  }

  @ApiOperation({
    summary: 'likelarni olish',
    description: 'tizimdagi barcha likelarni olish',
  })
  @ApiOkResponse({
    description: 'Muvaffaqiyatli olindi',
  })
  @ApiUnprocessableEntityResponse({
    description: "Xato tipdagi ma'lumot kiritildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get('likes/all')
  getAllLikes() {
    return this.likesService.getAllLikes();
  }
}
