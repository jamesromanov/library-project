import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { CreateBookDto } from 'src/books/dto/create-book.dto';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly BOOK_DATA_HASH_KEY = 'books:data';
  private readonly AUTOCOMPLETE_NAMES_KEY = 'autocomplete:product:names';

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
  // FOR auto complete search
  async addForAutoComplete(book: CreateBookDto, score: number = 0) {
    if (!book || !book.title || typeof book.title !== 'string') {
      console.warn('Attemted to add value with invalid format or invalid name');
      return;
    }
    const loweCasedTitle = book.title.toLocaleLowerCase();
    const pipeLine = this.redisCli.pipeline();
    const minPrefixLength = 1;

    for (let i = minPrefixLength; i < loweCasedTitle.length; i++) {
      const prefix = loweCasedTitle.substring(0, i);
      // storing a prefix of the name for searching later
      pipeLine.zadd(this.AUTOCOMPLETE_NAMES_KEY, score, prefix);
    }
    pipeLine.zadd(this.AUTOCOMPLETE_NAMES_KEY, score, loweCasedTitle + '*');

    pipeLine.hset(
      this.BOOK_DATA_HASH_KEY,
      loweCasedTitle,
      JSON.stringify(book),
    );

    await pipeLine.exec();
    console.log(`Adding autocommlete datastore: ${book.title}`);
  }

  // GEt autcomplete search
  async getFroAutocomplete(query: string, limit: number = 10) {
    console.log(query);
    if (!query || query.length === 0 || typeof query !== 'string') return [];

    const lowerCaseQuery = query.toLowerCase();
    const min = `[${lowerCaseQuery}`;
    const max = `[${lowerCaseQuery}\xff`;

    const rawNameSuggestion = await this.redisCli.zrangebylex(
      this.AUTOCOMPLETE_NAMES_KEY,
      min,
      max,
      'LIMIT',
      0,
      limit * 2,
    );

    const bookTitlesToRetrive = new Set<string>();

    for (const item of rawNameSuggestion) {
      if (item.endsWith('*')) {
        bookTitlesToRetrive.add(item.slice(0, -1));
      } else {
        bookTitlesToRetrive.add(item);
      }
      if (bookTitlesToRetrive.size >= limit) {
        break;
      }
    }

    const uniqueLowerCasedNames = Array.from(bookTitlesToRetrive);

    if (uniqueLowerCasedNames.length === 0) {
      return [];
    }

    console.log(uniqueLowerCasedNames);
    const booksJson = await this.redisCli.hmget(
      this.BOOK_DATA_HASH_KEY,
      ...uniqueLowerCasedNames,
    );

    const results: CreateBookDto[] = [];
    for (const jsonString of booksJson) {
      if (jsonString) {
        try {
          results.push(JSON.parse(jsonString));
        } catch (error) {
          console.error(`Failed to parse JSON:`, jsonString, error);
        }
      }
    }
    return results.slice(0, limit);
  }
}
