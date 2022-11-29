import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

        if (Authorization && req.session) {
            const secretKey: string = SECRET_KEY;
            const authVerificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
            const userId = authVerificationResponse.id;

            const users = new PrismaClient().user;
            const user = await users.findUnique({ where: { id: Number(userId) } });

            if (user && userId === req.session.userId) {
                req.user = user;
                next();
            } else {
                next(new HttpException(401, 'Wrong authentication token'));
            }
        } else {
            next(new HttpException(404, 'Authentication token missing'));
        }
    } catch (error) {
        next(new HttpException(401, 'Wrong authentication token'));
    }
};

export default authMiddleware;
