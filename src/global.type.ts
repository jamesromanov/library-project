import { Request } from 'express';
import { User } from 'generated/prisma';

export type CustomExpress = Request & { user: User };
