import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ImageDetailsDto {
  @ApiProperty({
    description: 'The name of the image',
    example: 'image.jpg',
  })
  @IsString()
  name: string;
}
