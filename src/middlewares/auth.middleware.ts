import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import AuthService from '@/services/auth.service';

class AuthMiddleware {
    public authService = new AuthService();

    public getAuthorization = (req: RequestWithUser) => {
        return req.header('Authorization').split('Bearer ')[1] ?? '';
    };

    public requireUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const Authorization = this.getAuthorization(req);
            if (!Authorization) next(new HttpException(404, 'Authentication token missing'));

            const authVerificationResponse = verify(Authorization, ACCESS_TOKEN_KEY) as DataStoredInToken;
            const userId = authVerificationResponse.id;

            const user = await this.authService.getUserById(userId);

            if (!user) next(new HttpException(401, 'Wrong authentication token'));

            req.user = user;
            next();

        } catch (error) {
            next(new HttpException(401, 'Wrong authentication token'));
        }
    };

    public requireAdmin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const Authorization = this.getAuthorization(req);
            if (!Authorization) next(new HttpException(404, 'Authentication token missing'));

            const authVerificationResponse = verify(Authorization, ACCESS_TOKEN_KEY) as DataStoredInToken;
            const userId = authVerificationResponse.id;

            const user = await this.authService.getUserById(userId);

            if (!user || user.role !== "ADMIN") {
                next(new HttpException(401, 'Wrong authentication token'));
            }

            req.user = user;
            next();

        } catch (error) {
            next(new HttpException(401, 'Wrong authentication token'));
        }
    };

    public refresh = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const refreshTokenCookie: string = req.cookies['refresh_token'] ?? '';
            if (!refreshTokenCookie) next(new HttpException(404, 'Refresh token missing'));

            res.setHeader('Set-Cookie', ['refresh_token=; Max-age=0']);

            const refreshVerificationResponse = verify(refreshTokenCookie, REFRESH_TOKEN_KEY) as DataStoredInToken;
            const userId = refreshVerificationResponse.id;

            const user = await this.authService.getUserById(userId);
            const isTokenValid = user.refreshToken && refreshTokenCookie && user.refreshToken === refreshTokenCookie;

            if (!isTokenValid) {
                await this.authService.updateUsersRefreshToken(user.id, null);
                next(new HttpException(401, 'Invalid refresh token'));
            }

            req.user = user;
            next();

        } catch (error) {
            next(new HttpException(401, 'Invalid refresh token'));
        }
    };
}

export default AuthMiddleware;