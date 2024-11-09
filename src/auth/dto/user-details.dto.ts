import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserDetails {
  @ApiProperty({
    example: 'hola@gmail.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'holasoyjuan',
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    example: 'ho32132',
  })
  @IsString()
  @IsOptional()
  password?: string;
}
