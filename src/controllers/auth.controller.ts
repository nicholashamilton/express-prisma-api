import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { CreateUserDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import AuthService from '@services/auth.service';

class AuthController {
    public authService = new AuthService();

    public signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body;
            const signUpUserData = await this.authService.signup(userData);

            res.status(201).json({
                data: {
                    user: this.authService.getPublicUser(signUpUserData),
                },
                message: 'signup',
            });

        } catch (error) {
            next(error);
        }
    };

    public logIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body;
            const { cookie, accessToken, refreshToken, findUser } = await this.authService.login(userData);

            await this.authService.updateUsersRefreshToken(findUser.id, refreshToken.token);

            res.setHeader('Set-Cookie', [cookie]);

            res.status(200).json({
                data: {
                    user: this.authService.getPublicUser(findUser),
                    accessToken,
                },
                message: 'login',
            });

        } catch (error) {
            next(error);
        }
    };

    public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userData = req.user;

            const logOutUserData = await this.authService.logout(userData);

            await this.authService.updateUsersRefreshToken(logOutUserData.id, null);

            res.setHeader('Set-Cookie', ['refresh_token=; Max-age=0']);

            res.status(200).json({
                data: {
                    user: this.authService.getPublicUser(logOutUserData),
                },
                message: 'logout',
            });

        } catch (error) {
            next(error);
        }
    };

    public secret = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userData = req.user;

            res.status(200).json({
                data: {
                    secret: `Only ${userData.email} can see this message.`,
                },
                message: 'secret',
            });

        } catch (error) {
            next(error);
        }
    };

    public current = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userData = req.user;

            res.status(200).json({
                data: {
                    user: this.authService.getPublicUser(userData),
                },
                message: 'currentUser',
            });

        } catch (error) {
            next(error);
        }
    };

    public refresh = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userData = req.user;

            const { cookie, accessToken, refreshToken } = this.authService.generateTokens(userData);

            await this.authService.updateUsersRefreshToken(userData.id, refreshToken.token);

            res.setHeader('Set-Cookie', [cookie]);

            res.status(200).json({
                data: {
                    user: this.authService.getPublicUser(userData),
                    accessToken,
                },
                message: 'refresh'
            });

        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
