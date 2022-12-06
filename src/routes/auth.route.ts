import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { userAuthMiddleware } from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class AuthRoute implements Routes {
    public path = '/';
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            '/signup',
            validationMiddleware(CreateUserDto, 'body'),
            this.authController.signUp
        );

        this.router.post(
            `/login`,
            validationMiddleware(CreateUserDto, 'body'),
            this.authController.logIn
        );

        this.router.post(
            `/logout`,
            userAuthMiddleware,
            this.authController.logOut
        );

        this.router.get(
            `/secret`,
            userAuthMiddleware,
            this.authController.secret
        );
    }
}

export default AuthRoute;
