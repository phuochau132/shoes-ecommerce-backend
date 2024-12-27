import { StatusCodes } from 'http-status-codes';
import { sign } from 'jsonwebtoken';
import { Inject, Service } from 'typedi';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import config from '@/config';
import ApiError from '@/errors/ApiError';
import {
  UserLoginDto,
  UserRegisterDto,
  UserType,
  UserUpdateDto,
} from '@/interfaces/user';
import RefreshToken from '@/models/refresh-token.model';
import UserService from '@/services/user.service';
import { comparePassword } from '@/utils/auth';
import { createToken } from '@/utils/jwt';
import { sendEmail } from '@/utils/mailer';
import { EmailEnum } from '@/constants/email.enum';
import { parseExpirationTime } from '@/utils/time';

@Service()
export default class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @Inject() private userService: UserService,
  ) {}

  async login(userLoginDto: UserLoginDto) {
    const user = await this.userService.findByEmail(userLoginDto.email);
    if (!user) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'User not found!',
      });
    }

    const isPasswordValid = await comparePassword(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Incorrect Password!',
      });
    }
    const refreshTokenInstance = this.refreshTokenRepository.create();
    const token = createToken(user.id);
    const refreshToken = await refreshTokenInstance.createToken(user);
    return { token, refreshToken };
  }

  async register(userRegisterDto: UserRegisterDto) {
    const isEmailExist = await this.userService.findByEmail(
      userRegisterDto.email,
    );

    if (isEmailExist) {
      throw new ApiError({
        status: StatusCodes.BAD_REQUEST,
        message: 'Email has already been used!',
      });
    }
    const user = await this.userService.createUser(userRegisterDto);
    const token = createToken(user.id);
    await sendEmail(user.email, EmailEnum.VERIFY_ACCOUNT, { token: token });

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new ApiError({
        status: StatusCodes.BAD_REQUEST,
        message: 'Email not found!',
      });
    }
    const token = createToken(user.id, parseExpirationTime('5m'));
    await sendEmail(user.email, EmailEnum.RESET_PASSWORD, { token: token });
    return true;
  }
  async resetPassword(user: UserType, newPassword: string) {
    await this.userService.updatePassword(user.id, newPassword);
    return true;
  }
  async verifyEmail(idUser: string) {
    const user = await this.userService.verifyEmailById(idUser);
    return user;
  }

  async updateProfile(id: string, updateData: UserUpdateDto) {
    await this.userService.updateUser(id, updateData);
    return updateData;
  }
  async verifyRefreshToken(requestToken: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: requestToken },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Refresh token is not registered!',
      });
    }

    if (refreshToken.verifyExpiration()) {
      this.refreshTokenRepository.delete(refreshToken);

      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Refresh token expired!',
      });
    }

    const newToken = createToken(refreshToken.user.id);

    return newToken;
  }
}
