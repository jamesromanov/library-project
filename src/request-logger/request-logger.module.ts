import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.json(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: './debug/debug.log',
          level: 'error',
        }),

        new winston.transports.File({
          filename: './info/info.log',
          level: 'info',
        }),
      ],
    }),
  ],
})
export class RequestLoggerModule {}
