import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LoginAdminAuthDto } from './dto/login-admin-auth.dto';
import { Request, Response } from 'express';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}
  // ADMIN creating
  @ApiOperation({
    summary: 'admin tayinlash',
    description:
      "admin tayinlash agarda mavjud bo'lmasa. Faqat bitta tayinlanishi mumkin.",
  })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiCreatedResponse({ description: "Muvaffaqiyatli qo'shildi" })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Post('register')
  createAdmin(@Body() createAdminAuthDto: CreateAdminAuthDto) {
    return this.adminAuthService.reateAdminAuth(createAdminAuthDto);
  }

  @ApiOperation({
    summary: 'admin login',
    description: "admin royhatdan o'tish",
  })
  @ApiCreatedResponse({
    description: "Muvaffaqiyatli ro'yhatdan o'tildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @Post('login')
  loginAdmin(
    @Body() loginAdminAuthDto: LoginAdminAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminAuthService.loginAdmin(loginAdminAuthDto, res);
  }

  @ApiOperation({
    summary: 'access token olish',
    description: 'cookida saqlanga refresh token asosida access token olinadi',
  })
  @ApiCreatedResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Post('refresh')
  refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {}
}
