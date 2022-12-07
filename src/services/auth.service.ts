import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { User } from '@prisma/client';
import { NODE_ENV, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { isEmpty } from '@utils/util';
import { prismaClient } from '@/prisma';

class AuthService {
    public users = prismaClient.user;

    public async signup(userData: CreateUserDto): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

        const findUser = await this.users.findUnique({ where: { email: userData.email } });
        if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

        const hashedPassword = await hash(userData.password, 10);
        const createUserData: Promise<User> = this.users.create({ data: { ...userData, password: hashedPassword } });

        return createUserData;
    }

    public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User, accessToken: TokenData, refreshToken: TokenData }> {
        if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

        const findUser: User = await this.users.findUnique({ where: { email: userData.email } });
        if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

        const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
        if (!isPasswordMatching) throw new HttpException(409, "Password is not matching");

        const { cookie, accessToken, refreshToken } = this.generateTokens(findUser);

        await this.updateUsersRefreshToken(findUser.id, refreshToken.token);

        return { cookie, findUser, accessToken, refreshToken };
    }

    public async logout(userData: User): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

        const findUser: User = await this.users.findFirst({ where: { email: userData.email, password: userData.password } });
        if (!findUser) throw new HttpException(409, "User doesn't exist");

        return findUser;
    }

    public createAccessToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { id: user.id };
        const expiresIn = 60 * 10;

        return { expiresIn, token: sign(dataStoredInToken, ACCESS_TOKEN_KEY, { expiresIn }) };
    }

    public createRefreshTokenToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { id: user.id };
        const expiresIn = 60 * 60 * 24;

        return { expiresIn, token: sign(dataStoredInToken, REFRESH_TOKEN_KEY, { expiresIn }) };
    }

    public createRefreshCookie(tokenData: TokenData) {
        const secure = NODE_ENV === 'production' ? 'secure;' : '';
        return `refresh_token=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}; SameSite=Lax; ${secure}`;
    }

    public generateTokens(user: User) {
        const accessToken = this.createAccessToken(user);
        const refreshToken = this.createRefreshTokenToken(user);
        const cookie = this.createRefreshCookie(refreshToken);

        return { cookie, accessToken, refreshToken };
    }

    public async updateUsersRefreshToken(userId: number, refreshToken: string | null) {
        return this.users.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }

    public async getUserById(userId: number) {
        return this.users.findUnique({
            where: { id: Number(userId) },
        });
    }

    public getPublicUser(user: User) {
        return {
            email: user.email,
            role: user.role,
        };
    }
}

export default AuthService;
