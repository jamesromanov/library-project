import { AdminRole } from './admin-auth/admin.role';

export interface User {
  name: string | null;
  id: string;
  email: string;
  password: string;
  refreshToken: string | null;
  role: AdminRole;
  createdAt: Date;
}

import { Request } from 'express';

export type CustomExpress = Request & { user: User };
