import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { adminAuthMiddleware } from '@middlewares/auth.middleware';

class UsersRoute implements Routes {
    public router = Router();
    public usersController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get(
            `/users`,
            adminAuthMiddleware,
            this.usersController.getUsers
        );

        this.router.get(
            `/users/:id(\\d+)`,
            adminAuthMiddleware,
            this.usersController.getUserById
        );

        this.router.post(
            `/users`,
            adminAuthMiddleware,
            validationMiddleware(CreateUserDto, 'body'),
            this.usersController.createUser
        );

        this.router.put(
            `/users/:id(\\d+)`,
            adminAuthMiddleware,
            validationMiddleware(CreateUserDto, 'body', true),
            this.usersController.updateUser
        );

        this.router.delete(
            `/users/:id(\\d+)`,
            adminAuthMiddleware,
            this.usersController.deleteUser
        );
    }
}

export default UsersRoute;
