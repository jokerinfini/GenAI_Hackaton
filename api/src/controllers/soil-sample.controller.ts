import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SoilSampleService } from '../services/soil-sample.service';
import { CreateSoilSampleDto, UpdateSoilSampleDto } from '../dto/soil-sample.dto';

@Controller('soil-samples')
export class SoilSampleController {
  constructor(private readonly soilSampleService: SoilSampleService) {}

  @Post()
  create(@Body() createSoilSampleDto: CreateSoilSampleDto) {
    return this.soilSampleService.create(createSoilSampleDto);
  }

  @Get()
  findAll() {
    return this.soilSampleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soilSampleService.findOne(id);
  }

  @Get('plot/:plotId')
  findByPlotId(@Param('plotId') plotId: string) {
    return this.soilSampleService.findByPlotId(plotId);
  }

  @Get('plot/:plotId/latest')
  getLatestByPlotId(@Param('plotId') plotId: string) {
    return this.soilSampleService.getLatestByPlotId(plotId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSoilSampleDto: UpdateSoilSampleDto) {
    return this.soilSampleService.update(id, updateSoilSampleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.soilSampleService.remove(id);
  }
}
