import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from 'generated/prisma/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getRequest<Response>();

    let message = 'Serverda hatolik';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception?.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus();
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
      default:
        console.log(exception as any);
        status = (exception as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = (exception as any)?.response?.message || message;
    }

    return {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }
}
