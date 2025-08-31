import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateTreeSampleDto {
  @IsString()
  @IsOptional()
  species?: string;

  @IsNumber()
  dbh_cm: number;
}

export class CreateTreeSamplesDto {
  @IsString()
  plotId: string;

  @IsArray()
  trees: CreateTreeSampleDto[];
}
