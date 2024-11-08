import { IsNumber, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  page: number;
  @IsNumber()
  @IsPositive()
  limit: number;
}
