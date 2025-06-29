import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from 'generated/prisma/runtime/library';
import { MulterError } from 'multer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
// Global exception filter to catch all errors
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    console.log(exception);
    let message = 'Serverda xatolik';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception?.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus();
        message = (exception as HttpException)?.message || message;
        break;
      case PrismaClientKnownRequestError:
        message = (exception as PrismaClientKnownRequestError).message;
        status = HttpStatus.CONFLICT;
        break;
      case PrismaClientRustPanicError:
        message = (exception as PrismaClientRustPanicError).message;
        status = HttpStatus.CONFLICT;
        break;
      case PrismaClientValidationError:
        message = (exception as PrismaClientValidationError).message;
        status = HttpStatus.CONFLICT;
        break;
      case PrismaClientInitializationError:
        message = (exception as PrismaClientInitializationError).message;
        status = HttpStatus.CONFLICT;
        break;
      case PrismaClientUnknownRequestError:
        message = (exception as PrismaClientUnknownRequestError).message;
        status = HttpStatus.CONFLICT;
        break;
      case ThrottlerException:
        message = "Bir vaqtda ko'p so'rovlar berildi. Iltimos kuting!";
        status = HttpStatus.TOO_MANY_REQUESTS;
        break;
      case MulterError:
        message = (exception as MulterError).message;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      default:
        status = (exception as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = (exception as any)?.response?.message
          ? (exception as any)?.response?.message
          : (exception as any).message || message;
    }

    this.logger.error(message, {
      path: request.url,
      ip: request.ip,
      statusCode: status,
    });

    return response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
