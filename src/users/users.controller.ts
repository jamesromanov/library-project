import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
} from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'generated/prisma';
import { Roles } from 'src/guards/roles';
import { AdminRole } from 'src/admin-auth/admin.role';
import { CreateUserDto } from './dto/create-user.dto';

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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.USER)
  @ApiOperation({
    summary: 'barcha foydalanuvchilarni olish (adminlar uchun)',
    description: 'barcha foydalanuvchilarni olish admin lar uchun',
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
