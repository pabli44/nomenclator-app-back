import { IsString, IsOptional } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
