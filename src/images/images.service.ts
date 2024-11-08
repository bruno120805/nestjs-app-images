import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { S3Service } from 'src/services/uploader/s3.service';
import { ImageDetailsDto } from './dto/image-details.dto';
import { v4 } from 'uuid';
import { TransformImageDto } from './dto/transform-image.dto';
import * as sharp from 'sharp';
import { Readable } from 'stream';
import { ClientProxy } from '@nestjs/microservices';
import { IMAGE_SERVICE } from 'src/config/service';

@Injectable()
export class ImagesService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(IMAGE_SERVICE) private readonly client: ClientProxy,
    private readonly uploadService: S3Service,
  ) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
  }

  async uploadImage(
    imageUpload: Express.Multer.File,
    imageDetails: ImageDetailsDto,
    userId: string,
  ) {
    const key = v4();
    const file = await this.image.create({
      data: {
        ...imageDetails,
        userId,
        image: key,
      },
    });
    await this.uploadService.upload(imageUpload, file.image);
  }

  async getAllImages(offset: number, limit: number) {
    return this.image.findMany({
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });
  }

  async getImageById(id: string) {
    try {
      const image = await this.image.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
      });

      if (!image) {
        throw new NotFoundException('Image not found');
      }

      return image;
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }
  // Función que convierte un stream en un Buffer
  async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = []; // Arreglo donde almacenaremos los fragmentos del stream

    // Leemos cada fragmento del stream
    for await (const chunk of stream) {
      chunks.push(chunk); // Agrega cada fragmento al arreglo
    }

    // Concatenamos todos los fragmentos en un único Buffer
    return Buffer.concat(chunks);
  }

  async transformImage(id: string, transformations: TransformImageDto) {
    // Enviar la tarea a la cola para procesamiento asíncrono
    this.client.emit('transform_image', { id, transformations });

    // Respuesta inmediata de que el trabajo ha sido enviado a la cola
    return { message: 'Image transformation job submitted successfully' };
  }

  async applyTransformations(id: string, transformations: TransformImageDto) {
    const image = await this.getImageById(id);

    const imageStream = await this.uploadService.getFileStream(image.image);
    const buffer = await this.streamToBuffer(imageStream);

    let imagePipeline = sharp(buffer);

    // Aplica las transformaciones a través del stream
    if (transformations.resize) {
      imagePipeline = imagePipeline.resize(
        transformations.resize.width,
        transformations.resize.height,
      );
    }

    if (transformations.crop) {
      imagePipeline = imagePipeline.extract({
        left: transformations.crop.x,
        top: transformations.crop.y,
        width: transformations.crop.width,
        height: transformations.crop.height,
      });
    }

    if (transformations.rotate) {
      imagePipeline = imagePipeline.rotate(transformations.rotate);
    }
    if (transformations.filters && transformations.filters.grayscale) {
      imagePipeline = imagePipeline.grayscale();
    }

    if (transformations.format) {
      imagePipeline = imagePipeline.toFormat(transformations.format);
    }

    try {
      const transformedBuffer = await imagePipeline.toBuffer();
      const transformedFile: Express.Multer.File = {
        fieldname: `${image.name}`,
        originalname: `${image.image}.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: transformedBuffer.length,
        buffer: transformedBuffer,
        stream: Readable.from(transformedBuffer),
        destination: '',
        filename: '',
        path: '',
      };

      await this.uploadService.upload(transformedFile, image.image);

      return {
        transformations: {
          resize: {
            width: transformations.resize.width,
            height: transformations.resize.height,
          },
          crop: transformations.crop
            ? {
                x: transformations.crop.x,
                y: transformations.crop.y,
                width: transformations.crop.width,
                height: transformations.crop.height,
              }
            : undefined,
          rotate: transformations.rotate,
          format: transformations.format,
          filters: {
            grayscale: transformations.filters?.grayscale,
            sepia: transformations.filters?.sepia,
          },
        },
      };
    } catch (error) {
      throw new Error('Error applying image transformations: ' + error.message);
    }
  }

  async deleteImage(id: string) {
    try {
      const image = await this.getImageById(id);

      // delete it from aws bucket and from the database
      await this.uploadService.delete(image.image);
      await this.image.delete({ where: { id } });

      return {
        message: 'Image deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Image not found');
      }

      // Si la eliminación en AWS falla, puede lanzar un BadRequestException con el mensaje específico
      throw new BadRequestException('Error deleting image: ' + error.message);
    }
  }
}
