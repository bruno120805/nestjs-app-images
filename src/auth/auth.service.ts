import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDetails } from './dto/user-details.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(userDetails: UserDetails) {
    console.log('AuthService');
    console.log(userDetails);

    const user = await this.prisma.user.findFirst({
      where: { email: userDetails.email },
    });

    if (user) return user;

    console.log('User not found, creating new user');
    const newUser = this.prisma.user.create({
      data: {
        email: userDetails.email,
        displayName: userDetails.displayName,
      },
    });

    return newUser;
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }
}
