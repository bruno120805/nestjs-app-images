import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { S3Service } from 'src/services/uploader/s3.service';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { RabbitModule } from './transports/rabbitmq.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 2,
      },
    ]),
    RabbitModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService, S3Service],
})
export class ImagesModule {}
