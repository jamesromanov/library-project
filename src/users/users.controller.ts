import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, User } from 'generated/prisma';
import { Roles } from 'src/guards/roles';
import { AdminRole } from 'src/admin-auth/admin.role';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserAuthDto } from './dto/user-login.auth.dto';
import { Request, Response } from 'express';
import { UserQueryDto } from './dto/user.query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Users register method
  @ApiOperation({
    summary: "user qo'shish",
    description: "user qo'shish yani registratsiya",
  })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiCreatedResponse({ description: "Muvaffaqiyatli qo'shildi" })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }
  @ApiOperation({
    summary: 'user login',
    description: "admin royhatdan o'tish",
  })
  @ApiCreatedResponse({
    description: "Muvaffaqiyatli ro'yhatdan o'tildi",
  })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @Post('login')
  login(
    @Body() loginAuthDto: LoginUserAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.login(loginAuthDto, res);
  }
  // USER refresh the token
  @ApiOperation({
    summary: 'access token olish',
    description:
      'cookida saqlanga refresh token asosida access token olinadi userlar uchun',
  })
  @ApiUnauthorizedResponse({
    description: "Tokenda yoki Hato ma'lumot kiritilgandagi xatolik",
  })
  @ApiCreatedResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Post('refresh')
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.usersService.refreshTokenUser(req, res);
  }
  // USER logout
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'foydalanuvchi logout',
    description: 'foydalanuvchi logout qiladi',
  })
  @ApiUnauthorizedResponse({
    description: "Tokenda yoki Hato ma'lumot kiritilgandagi xatolik",
  })
  @ApiCreatedResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.usersService.logout(req, res);
  }
  // USER find All method
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'barcha foydalanuvchilarni olish (adminlar uchun)',
    description: 'barcha foydalanuvchilarni olish admin lar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'page', type: 'number' })
  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }
  // USER update
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'foydalanuvchini olish (adminlar uchun)',
    description: 'foydalanuvchi id orqali olish admin lar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // USER update
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.USER)
  @ApiOperation({
    summary: "foydalanuvchi ma'lumorlarini yangilash",
    description: "foydalanuvchini ma'lumotlarini yangilash",
  })
  @ApiUnauthorizedResponse({
    description: "Tokenda yoki Hato ma'lumot kiritilgandagi xatolik",
  })
  @ApiCreatedResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // USER delete
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.USER)
  @ApiOperation({
    summary: "foydalanuvchini o'chirish",
    description: "foydalanuvchini o'chirish",
  })
  @ApiUnauthorizedResponse({
    description: "Tokenda yoki Hato ma'lumot kiritilgandagi xatolik",
  })
  @ApiCreatedResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: "foydalanuvchi o'zini ko'rish",
  })
  @ApiUnauthorizedResponse({
    description: "Tokenda yoki Hato ma'lumot kiritilgandagi xatolik",
  })
  @ApiCreatedResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiBadRequestResponse({ description: "Xato ma'lumot kiritildi" })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get('get/me')
  getMe(@Req() req: Request) {
    return this.usersService.getMe(req);
  }
}
