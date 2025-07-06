import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from './redis/redis.service';

@Injectable()
export class GuardMiddleware implements NestMiddleware {
  constructor(private redis: RedisService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const token = await req.headers.authorization?.split(' ')[1];
    const getBlacklistedToken = await this.redis.get(
      `blacklist:token:${token}`,
    );
    if (getBlacklistedToken) throw new UnauthorizedException('Token yaroqsiz');
    console.log(getBlacklistedToken, '=======');
    next();
  }
}
