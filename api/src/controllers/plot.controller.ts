import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PlotService } from '../services/plot.service';
import { CreatePlotDto } from '../dto/plot.dto';

@Controller('plots')
export class PlotController {
  constructor(private readonly plotService: PlotService) {}

  @Post()
  create(@Body() createPlotDto: CreatePlotDto) {
    return this.plotService.create(createPlotDto);
  }

  @Get()
  findAll() {
    return this.plotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plotService.findOne(id);
  }
}
