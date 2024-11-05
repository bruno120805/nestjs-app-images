import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDetails } from './dto/user-details.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  signToken(payload: TokenDto) {
    return this.jwtService.sign(payload);
  }

  async validateUser(userDetails: UserDetails) {
    // console.log('AuthService');
    // console.log(userDetails);

    const user = await this.prisma.user.findFirst({
      where: { email: userDetails.email },
    });

    if (user) return user;

    console.log('User not found, creating new user');
    const newUser = await this.prisma.user.create({
      data: {
        email: userDetails.email,
        displayName: userDetails.displayName,
      },
    });

    return {
      newUser,
      accessToken: this.jwtService.sign({ email: userDetails.email }),
    };
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async registerUser(userDto: UserDetails) {
    try {
      const { password, email } = userDto;
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('This email is already registered');
      }
      if (!userDto.password) {
        throw new BadRequestException('Password is required');
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: { ...userDto, password: hashedPassword },
      });

      const refreshToken = await this.generateRefreshToken(user.id);

      return {
        user,
        accessToken: this.jwtService.sign({ email: user.email }),
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      jwt: this.jwtService.sign({ email: user.email }),
      refreshToken,
    };
  }

  async generateRefreshToken(userId: string) {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });
    return refreshToken;
  }

  async renewAccessToken(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    const newAccessToken = this.jwtService.sign({ email: user.email });
    return { accessToken: newAccessToken };
  }
}
