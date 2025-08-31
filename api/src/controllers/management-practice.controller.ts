import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ManagementPracticeService } from '../services/management-practice.service';
import { CreateManagementPracticeDto, UpdateManagementPracticeDto } from '../dto/management-practice.dto';

@Controller('management-practices')
export class ManagementPracticeController {
  constructor(private readonly managementPracticeService: ManagementPracticeService) {}

  @Post()
  create(@Body() createManagementPracticeDto: CreateManagementPracticeDto) {
    return this.managementPracticeService.create(createManagementPracticeDto);
  }

  @Post('plot/:plotId/bulk')
  createMany(
    @Param('plotId') plotId: string,
    @Body() practicesArray: Omit<CreateManagementPracticeDto, 'plotId'>[]
  ) {
    return this.managementPracticeService.createMany(plotId, practicesArray);
  }

  @Get()
  findAll() {
    return this.managementPracticeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managementPracticeService.findOne(id);
  }

  @Get('plot/:plotId')
  findByPlotId(@Param('plotId') plotId: string) {
    return this.managementPracticeService.findByPlotId(plotId);
  }

  @Get('plot/:plotId/year/:year')
  findByPlotIdAndYear(
    @Param('plotId') plotId: string,
    @Param('year') year: string
  ) {
    return this.managementPracticeService.findByPlotIdAndYear(plotId, parseInt(year));
  }

  @Get('plot/:plotId/year/:year/summary')
  getAnnualSummary(
    @Param('plotId') plotId: string,
    @Param('year') year: string
  ) {
    return this.managementPracticeService.getAnnualSummary(plotId, parseInt(year));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateManagementPracticeDto: UpdateManagementPracticeDto) {
    return this.managementPracticeService.update(id, updateManagementPracticeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.managementPracticeService.remove(id);
  }
}
