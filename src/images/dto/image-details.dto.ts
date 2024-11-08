import { IsString } from 'class-validator';

export class ImageDetailsDto {
  @IsString()
  name: string;
}
