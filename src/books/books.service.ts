import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Book } from 'generated/prisma';

@Injectable()
export class BooksService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}
  async create(createBookDto: CreateBookDto, image: Express.Multer.File) {
    createBookDto.pages = Number(createBookDto.pages);
    createBookDto.price = Number(createBookDto.price);
    createBookDto.publishedYear = Number(createBookDto.publishedYear);
    await this.cloudinaryService
      .uploadImage(image)
      .then(async (data) => {
        await this.prisma.book.create({
          data: { ...createBookDto, image: data.secure_url },
        });
      })
      .catch(() => {
        throw new BadRequestException('Yaroqsiz file turi');
      });
    return "Muvaffaqiyatli qo'shildi";
  }

  findAll() {
    return `This action returns all books`;
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
