import { Injectable } from '@nestjs/common';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { UpdateAdminAuthDto } from './dto/update-admin-auth.dto';

@Injectable()
export class AdminAuthService {
  create(createAdminAuthDto: CreateAdminAuthDto) {
    return 'This action adds a new adminAuth';
  }

  findAll() {
    return `This action returns all adminAuth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminAuth`;
  }

  update(id: number, updateAdminAuthDto: UpdateAdminAuthDto) {
    return `This action updates a #${id} adminAuth`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminAuth`;
  }
}
