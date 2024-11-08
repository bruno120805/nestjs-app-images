import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ImageDetailsDto } from './dto/image-details.dto';
import { TransformImageDto } from './dto/transform-image.dto';
import { ImagesService } from './images.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 1024 * 1024, //1MB
      },
    }),
  )
  async uploadImage(
    @Body() imageDetails: ImageDetailsDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!image) {
      throw new BadRequestException('No file uploaded');
    }
    if (image.size > 1024 * 1024) {
      throw new BadRequestException('File size exceeds 1MB limit');
    }
    // Llama a tu servicio para manejar la subida de la imagen
    const uploadedImage = await this.imagesService.uploadImage(
      image,
      imageDetails,
      req.user['userId'],
    );
    return {
      message: 'Image uploaded successfully',
      imageDetails: uploadedImage,
    };
  }

  @Get()
  getAllImages(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    // Define un valor máximo para limit, por ejemplo, 100, para evitar sobrecargar el sistema con demasiados resultados
    const maxLimit = 100;
    const effectiveLimit = Math.min(limit, maxLimit);

    // Calcula el desplazamiento (offset) basado en la página y el límite
    const offset = (page - 1) * effectiveLimit;

    return this.imagesService.getAllImages(offset, effectiveLimit);
  }

  @Get(':imageId')
  getImageById(@Param('imageId', ParseUUIDPipe) id: string) {
    return this.imagesService.getImageById(id);
  }

  @UseGuards(ThrottlerGuard)
  @Post(':imageId/transform')
  async transformImage(
    @Param('imageId', ParseUUIDPipe) id: string,
    @Body() transformImageDto: TransformImageDto,
  ) {
    return this.imagesService.transformImage(id, transformImageDto);
  }

  @EventPattern('transform_image')
  async handleImageTransform(
    @Payload() data: { id: string; transformations: TransformImageDto },
  ) {
    const { id, transformations } = data;

    try {
      await this.imagesService.applyTransformations(id, transformations);
      // console.log(`Image ${id} transformed successfully.`);
    } catch (error) {
      console.log(`Error transforming Image ${id}:`, error);
    }
  }

  @Delete(':imageId')
  deleteImage(@Param('imageId', ParseUUIDPipe) id: string) {
    return this.imagesService.deleteImage(id);
  }
}
