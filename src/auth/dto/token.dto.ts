import { IsEmail, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  id: string;
  @IsEmail()
  email: string;
}
