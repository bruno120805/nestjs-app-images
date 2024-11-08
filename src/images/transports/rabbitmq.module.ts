import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IMAGE_SERVICE } from 'src/config/service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: IMAGE_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // URL of your RabbitMQ instance
          queue: 'image_transformation_queue', // Queue name
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: IMAGE_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // URL of your RabbitMQ instance
          queue: 'image_transformation_queue', // Queue name
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
})
export class RabbitModule {}
