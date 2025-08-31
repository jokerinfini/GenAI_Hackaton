import { IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateSoilSampleDto {
  @IsString()
  plotId: string;

  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  bulkDensity: number; // g/cm³

  @IsNumber()
  @Min(10)
  @Max(100)
  soilDepth: number; // cm

  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  carbonConcentration: number; // %

  @IsNumber()
  @Min(0)
  @Max(100)
  clayContent: number; // %

  @IsDateString()
  samplingDate: string;
}

export class UpdateSoilSampleDto {
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  bulkDensity?: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  soilDepth?: number;

  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  carbonConcentration?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  clayContent?: number;

  @IsDateString()
  samplingDate?: string;
}
