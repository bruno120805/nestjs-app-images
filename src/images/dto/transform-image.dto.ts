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

class ResizeOptions {
  @IsNumber()
  @IsPositive()
  width: number;

  @IsNumber()
  @IsPositive()
  height: number;
}

class FilterOptions {
  @IsOptional()
  @IsBoolean()
  grayscale?: boolean;

  @IsOptional()
  @IsBoolean()
  sepia?: boolean;
}

class CropOptions {
  @IsNumber()
  @IsPositive()
  x: number;

  @IsNumber()
  @IsPositive()
  y: number;

  @IsNumber()
  @IsPositive()
  width: number;

  @IsNumber()
  @IsPositive()
  height: number;
}

export class TransformImageDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ResizeOptions)
  resize?: ResizeOptions;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CropOptions)
  crop?: CropOptions;

  @IsOptional()
  @IsNumber()
  rotate?: number;

  @IsOptional()
  @IsString()
  @IsEnum(ImageFormat)
  format?: ImageFormat;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterOptions)
  filters?: FilterOptions;
}
