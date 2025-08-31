import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateClimateDataDto {
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
  @Min(-50)
  @Max(60)
  meanTemperature: number; // °C

  @IsNumber()
  @Min(0)
  @Max(2000)
  totalRainfall: number; // mm

  @IsNumber()
  @Min(0)
  @Max(500)
  evaporation: number; // mm
}

export class UpdateClimateDataDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsInt()
  @Min(2000)
  @Max(2030)
  year?: number;

  @IsNumber()
  @Min(-50)
  @Max(60)
  meanTemperature?: number;

  @IsNumber()
  @Min(0)
  @Max(2000)
  totalRainfall?: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  evaporation?: number;
}
