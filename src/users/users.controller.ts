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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
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
import { Role } from 'generated/prisma';
import { Roles } from 'src/guards/roles';
import { AdminRole } from 'src/admin-auth/admin.role';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserAuthDto } from './dto/user-login.auth.dto';
import { Request, Response } from 'express';

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
  // USER find All method
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiOperation({
    summary: 'barcha foydalanuvchilarni olish (adminlar uchun)',
    description: 'barcha foydalanuvchilarni olish admin lar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  // USER update
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.USER)
  @ApiOperation({
    summary: 'foydalanuvchini olish (adminlar uchun)',
    description: 'foydalanuvchi id orqali olish admin lar uchun',
  })
  @ApiOkResponse({ description: 'Muvaffaqiyatli olindi' })
  @ApiConflictResponse({ description: 'Conflict xatolik' })
  @ApiInternalServerErrorResponse({ description: 'Serverda xatolik' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
