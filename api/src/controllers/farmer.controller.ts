import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FarmerService } from '../services/farmer.service';
import { CreateFarmerDto } from '../dto/farmer.dto';

@Controller('farmers')
export class FarmerController {
  constructor(private readonly farmerService: FarmerService) {}

  @Post()
  create(@Body() createFarmerDto: CreateFarmerDto) {
    return this.farmerService.create(createFarmerDto);
  }

  @Get()
  findAll() {
    return this.farmerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmerService.findOne(id);
  }
}
