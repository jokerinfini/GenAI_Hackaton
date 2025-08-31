import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TreeSampleService } from '../services/tree-sample.service';
import { CreateTreeSamplesDto } from '../dto/tree-sample.dto';

@Controller('plots/:plotId/trees')
export class TreeSampleController {
  constructor(private readonly treeSampleService: TreeSampleService) {}

  @Post()
  create(@Param('plotId') plotId: string, @Body() createTreeSamplesDto: CreateTreeSamplesDto) {
    console.log('Received tree samples request:', { plotId, body: createTreeSamplesDto });
    return this.treeSampleService.createMany(plotId, createTreeSamplesDto.trees || []);
  }

  @Get()
  findByPlotId(@Param('plotId') plotId: string) {
    return this.treeSampleService.findByPlotId(plotId);
  }
}
