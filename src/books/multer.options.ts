import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path';

export const multerOptions = {
  limits: {
    fileSize: Number(process.env.MAX_IMAGE_SIZE),
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) cb(null, true);
    else
      cb(
        new HttpException(
          "Qo'llab quvvatlanmagan file tipi: " +
            path.extname(file.originalname),
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
  },
  storage: diskStorage({
    destination: process.env.MULTER_DESTINATION,
    filename: (req: any, file: any, cb: any) => {
      cb(
        null,
        Date.now() +
          '-' +
          Math.floor(Math.random() * 10000) +
          path.extname(file.originalname) || file.originalname,
      );
    },
  }),
};

export const multerConfig = {
  dest: process.env.MULTER_DESTINATION,
};
