import { v2 } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constraints';

export const CloudinaryProvider2 = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: process.env.CLOUD_NAME1,
      api_key: process.env.CLOUD_API_KEY1,
      api_secret: process.env.CLOUD_API_SECRET1,
    });
  },
};
