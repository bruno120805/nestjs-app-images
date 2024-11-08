import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { ImagesModule } from './images/images.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PrismaModule,
    PassportModule.register({
      session: true,
    }),
    ImagesModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
