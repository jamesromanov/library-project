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
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginAdminAuthDto } from './dto/login-admin-auth.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAdminAuthDto } from './dto/update-admin.auth.dto';
import { using } from 'rxjs';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'generated/prisma';
import { Roles } from 'src/guards/roles';
import { AdminRole } from './admin.role';
import { CustomExpress } from 'src/global.type';
import { authenticate } from 'passport';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('register')
  createAdmin(
    @Body() createAdminAuthDto: CreateAdminAuthDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.adminAuthService.createAdminAuth(createAdminAuthDto, image);
  }
  // ADMIN login
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
  loginAdmin(@Body() loginAdminAuthDto: LoginAdminAuthDto) {
    return this.adminAuthService.loginAdmin(loginAdminAuthDto);
  }
  // ADMIN get
  @ApiOperation({
    summary: 'admin get',
    description: 'admin ni olish',
  })
  @ApiCreatedResponse({
    description: 'Muvaffaqiyatli olindi',
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @Get('get')
  getAdmin() {
    return this.adminAuthService.getAdmin();
  }

  // [PUT] admin
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiOperation({
    summary: `admin ma'lumotlarini yangilash`,
    description: 'admin malumotlarini yangilash',
  })
  @ApiOkResponse({
    description: 'Muvaffaqiyatli yangilandi',
  })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @Put('update')
  udpateAdmin(
    @Body() updateAdminAuthDto: UpdateAdminAuthDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: CustomExpress,
  ) {
    return this.adminAuthService.updateAdmin(req, updateAdminAuthDto, image);
  }

  @ApiOperation({
    summary: `admin uchun statistica`,
    description: 'admin statistika',
  })
  @ApiOkResponse({
    description: 'Muvaffaqiyatli olindi',
  })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @Get('statistics')
  statistics() {
    return this.adminAuthService.getStatistics();
  }
}
