import { IsString, IsNumber, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class CreateManagementPracticeDto {
  @IsString()
  plotId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(2030)
  year: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  carbonInputs: number; // t C/ha

  @IsNumber()
  @Min(0.5)
  @Max(3.0)
  dpmRpmRatio: number; // default 1.44

  @IsBoolean()
  soilCover: boolean; // vegetated/bare

  @IsNumber()
  @Min(0)
  @Max(500)
  fertilizerN: number; // kg N/ha

  @IsBoolean()
  livestockPresent: boolean; // for CH4 calculation
}

export class UpdateManagementPracticeDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsInt()
  @Min(2000)
  @Max(2030)
  year?: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  carbonInputs?: number;

  @IsNumber()
  @Min(0.5)
  @Max(3.0)
  dpmRpmRatio?: number;

  @IsBoolean()
  soilCover?: boolean;

  @IsNumber()
  @Min(0)
  @Max(500)
  fertilizerN?: number;

  @IsBoolean()
  livestockPresent?: boolean;
}
