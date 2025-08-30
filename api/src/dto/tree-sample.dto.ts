import { IsString, IsNumber, IsOptional } from 'class-validator';

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

  trees: CreateTreeSampleDto[];
}
