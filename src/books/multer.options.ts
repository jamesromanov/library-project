import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';

export const multerOptions = {
  limits: {
    fileSize: eval(process.env.MAX_IMAGE_SIZE as string),
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) cb(null, true);
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
