import { IsString, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlotDto {
  @IsString()
  name: string;

  @IsString()
  farmerId: string;

  @IsObject()
  geometry: any; // GeoJSON Polygon

  @IsNumber()
  areaHa: number;
}
