import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
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
import { Response } from 'express';

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
}
