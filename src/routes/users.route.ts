import { Router } from 'express';
import AuthMiddleware from '@/middlewares/auth.middleware';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class UsersRoute implements Routes {
    public router = Router();
    public authMiddleware = new AuthMiddleware();
    public usersController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get(
            `/users`,
            this.authMiddleware.requireAdmin,
            this.usersController.getUsers
        );

        this.router.get(
            `/users/:id(\\d+)`,
            this.authMiddleware.requireAdmin,
            this.usersController.getUserById
        );

        this.router.post(
            `/users`,
            this.authMiddleware.requireAdmin,
            validationMiddleware(CreateUserDto, 'body'),
            this.usersController.createUser
        );

        this.router.put(
            `/users/:id(\\d+)`,
            this.authMiddleware.requireAdmin,
            validationMiddleware(CreateUserDto, 'body', true),
            this.usersController.updateUser
        );

        this.router.delete(
            `/users/:id(\\d+)`,
            this.authMiddleware.requireAdmin,
            this.usersController.deleteUser
        );
    }
}

export default UsersRoute;
