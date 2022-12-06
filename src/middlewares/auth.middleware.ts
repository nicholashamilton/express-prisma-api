import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

const getAuthorization = (req: RequestWithUser) => {
    let token: string = req.cookies['Authorization'] ?? '';
    if (!token) token = req.header('Authorization').split('Bearer ')[1] ?? '';
    return token;
}

const userAuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const Authorization = getAuthorization(req);

        if (!Authorization) next(new HttpException(404, 'Authentication token missing'));

        const secretKey: string = SECRET_KEY;
        const authVerificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
        const userId = authVerificationResponse.id;

        const users = new PrismaClient().user;
        const user = await users.findUnique({ where: { id: Number(userId) } });

        if (!user) next(new HttpException(401, 'Wrong authentication token'));

        req.user = user;
        next();

    } catch (error) {
        next(new HttpException(401, 'Wrong authentication token'));
    }
};

const adminAuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const Authorization = getAuthorization(req);

        if (!Authorization) next(new HttpException(404, 'Authentication token missing'));

        const secretKey: string = SECRET_KEY;
        const authVerificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
        const userId = authVerificationResponse.id;

        const users = new PrismaClient().user;
        const user = await users.findUnique({ where: { id: Number(userId) } });

        if (!user || user.role !== "ADMIN") next(new HttpException(401, 'Wrong authentication token'));

        req.user = user;
        next();

    } catch (error) {
        next(new HttpException(401, 'Wrong authentication token'));
    }
};

export { userAuthMiddleware, adminAuthMiddleware, };
