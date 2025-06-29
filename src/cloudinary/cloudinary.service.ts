import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

// UPLOAD to the CLOUDINARY
@Injectable()
export class CloudinaryService {
  async uploadImage(
    image: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result: any) => {
        if (error) return reject(error);
        resolve(result);
      });

      //   const stream = Readable.from(image.buffer);
      toStream(image.buffer).pipe(upload);
    });
  }
}
