import { Router } from 'express';
import AuthMiddleware from '@/middlewares/auth.middleware';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class AuthRoute implements Routes {
    public path = '/';
    public router = Router();
    public authMiddleware = new AuthMiddleware();
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
            this.authMiddleware.requireUser,
            this.authController.logOut
        );

        this.router.get(
            `/secret`,
            this.authMiddleware.requireUser,
            this.authController.secret
        );

        this.router.get(
            `/currentUser`,
            this.authMiddleware.requireUser,
            this.authController.current
        );

        this.router.get(
            `/refresh`,
            this.authMiddleware.refresh,
            this.authController.refresh
        );
    }
}

export default AuthRoute;
