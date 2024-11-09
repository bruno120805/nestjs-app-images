import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ImageFormat } from '../enums/image-format.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ResizeOptions {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  width: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  height: number;
}

class FilterOptions {
  @ApiPropertyOptional({
    description: 'The brightness of the image',
  })
  @IsOptional()
  @IsBoolean()
  grayscale?: boolean;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsBoolean()
  sepia?: boolean;
}
class CropOptions {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  x: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  y: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  width: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  height: number;
}

export class TransformImageDto {
  @ApiPropertyOptional({
    description: 'The width of the image',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ResizeOptions)
  resize?: ResizeOptions;

  @ApiPropertyOptional({
    description: 'The crop options for the image',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CropOptions)
  crop?: CropOptions;

  @ApiPropertyOptional({
    description: 'The rotation angle of the image in degrees',
  })
  @IsOptional()
  @IsNumber()
  rotate?: number;

  @ApiPropertyOptional({
    description: 'The format of the image',
    enum: ImageFormat,
  })
  @IsOptional()
  @IsString()
  @IsEnum(ImageFormat)
  format?: ImageFormat;

  @ApiPropertyOptional({
    description: 'Filters to apply to the image',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterOptions)
  filters?: FilterOptions;
}
