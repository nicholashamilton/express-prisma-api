import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { CreateUserDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import AuthService from '@services/auth.service';

class AuthController {
    public authService = new AuthService();

    public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: CreateUserDto = req.body;
            const signUpUserData: User = await this.authService.signup(userData);

            res.status(201).json({ data: { user: { email: signUpUserData.email } }, message: 'signup' });

        } catch (error) {
            next(error);
        }
    };

    public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: CreateUserDto = req.body;
            const { cookie, findUser } = await this.authService.login(userData);

            req.session.userId = findUser.id;
            res.setHeader('Set-Cookie', [cookie]);

            res.status(200).json({ data: { user: { email: userData.email } }, message: 'login' });

        } catch (error) {
            next(error);
        }
    };

    public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData = req.user;
            const logOutUserData: User = await this.authService.logout(userData);

            req.session.destroy(() => {
                res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
                res.status(200).json({ data: { user: { email: logOutUserData.email } }, message: 'logout' });
            });

        } catch (error) {
            next(error);
        }
    };

    public secret = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: User = req.user;
            res.status(200).json({ data: { secret: `Only ${userData.email} can see this message.` }, message: 'secret' });

        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
