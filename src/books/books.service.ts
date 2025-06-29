import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BooksService {
  constructor(private cloudinaryService: CloudinaryService) {}
  async create(createBookDto: CreateBookDto, image: Express.Multer.File) {
    await this.cloudinaryService
      .uploadImage(image)
      .then((data) => (createBookDto.image = data.secure_url))
      .catch(() => {
        throw new BadRequestException('Yaroqsiz file turi');
      });
    console.log(createBookDto);
    return 'This action adds a new book';
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
