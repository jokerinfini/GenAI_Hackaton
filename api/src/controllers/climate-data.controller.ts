import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ClimateDataService } from '../services/climate-data.service';
import { CreateClimateDataDto, UpdateClimateDataDto } from '../dto/climate-data.dto';

@Controller('climate-data')
export class ClimateDataController {
  constructor(private readonly climateDataService: ClimateDataService) {}

  @Post()
  create(@Body() createClimateDataDto: CreateClimateDataDto) {
    return this.climateDataService.create(createClimateDataDto);
  }

  @Post('plot/:plotId/bulk')
  createMany(
    @Param('plotId') plotId: string,
    @Body() climateDataArray: Omit<CreateClimateDataDto, 'plotId'>[]
  ) {
    return this.climateDataService.createMany(plotId, climateDataArray);
  }

  @Get()
  findAll() {
    return this.climateDataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.climateDataService.findOne(id);
  }

  @Get('plot/:plotId')
  findByPlotId(@Param('plotId') plotId: string) {
    return this.climateDataService.findByPlotId(plotId);
  }

  @Get('plot/:plotId/year/:year')
  findByPlotIdAndYear(
    @Param('plotId') plotId: string,
    @Param('year') year: string
  ) {
    return this.climateDataService.findByPlotIdAndYear(plotId, parseInt(year));
  }

  @Get('plot/:plotId/averages')
  getMonthlyAverages(
    @Param('plotId') plotId: string,
    @Query('startYear') startYear: string,
    @Query('endYear') endYear: string
  ) {
    return this.climateDataService.getMonthlyAverages(
      plotId,
      parseInt(startYear),
      parseInt(endYear)
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateClimateDataDto: UpdateClimateDataDto) {
    return this.climateDataService.update(id, updateClimateDataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.climateDataService.remove(id);
  }
}
