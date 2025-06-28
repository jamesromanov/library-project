import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisCli: Redis;
  onModuleInit() {
    this.redisCli = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });

    this.redisCli.on('connect', () => {
      console.log('Reddis connected✅');
    });

    this.redisCli.on('error', (err) => {
      console.log('Reddis connection error❌:', err);
    });
  }

  async get(key: string) {
    return this.redisCli.get(key);
  }

  async set(key: string, val: any, expire?: number) {
    if (expire)
      return await this.redisCli.set(key, JSON.stringify(val), 'EX', expire);
    else return await this.redisCli.set(key, JSON.stringify(val));
  }

  async del(key: string) {
    return await this.redisCli.del(key);
  }
}
