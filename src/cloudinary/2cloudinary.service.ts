import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { Readable } from 'stream';

// UPLOAD to the CLOUDINARY psf file
@Injectable()
export class CloudinaryService2 {
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader
        .upload_stream(
          { resource_type: 'raw', format: 'pdf', access_mode: 'public' },
          (error, result: any) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
      //   const readableStream = new Readable();
      //   readableStream.push(file.buffer);
      //   readableStream.push(null);
      //   readableStream.push(upload);
    });
  }
}
