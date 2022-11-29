import { Request } from 'express';
import { User } from '@prisma/client';

export interface DataStoredInToken {
    id: number;
}

export interface TokenData {
    token: string;
    expiresIn: number;
}

export interface PublicUser {
    email: string;
}

export interface RequestWithUser extends Request {
    user: User;
}
