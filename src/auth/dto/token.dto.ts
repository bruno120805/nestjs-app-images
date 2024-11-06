import { IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  email: string;
}