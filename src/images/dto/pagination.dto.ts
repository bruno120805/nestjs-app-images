import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  page: number;

  @ApiProperty({
    default: 10,
  })
  @IsNumber()
  @IsPositive()
  limit: number;
}
