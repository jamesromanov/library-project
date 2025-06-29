import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';

export const multerOptions = {
  limits: {
    fileSize:
      // Number(process.env.MAX_IMAGE_SIZE) ||
      2000000,
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
  storage: memoryStorage(),
};

export const multerConfig = {
  dest: process.env.MULTER_DESTINATION,
};
