import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateFarmerDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
