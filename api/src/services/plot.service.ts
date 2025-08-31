import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreatePlotDto, UpdatePlotDto } from '../dto/plot.dto';

@Injectable()
export class PlotService {
  constructor(private prisma: PrismaService) {}

  async create(createPlotDto: CreatePlotDto) {
    return this.prisma.plot.create({
      data: createPlotDto,
      include: {
        treeSamples: true,
        calcs: true,
      },
    });
  }

  async findAll() {
    return this.prisma.plot.findMany({
      include: {
        treeSamples: true,
        calcs: true,
      },
    });
  }

  async findByFarmerId(farmerId: string) {
    return this.prisma.plot.findMany({
      where: { farmerId },
      include: {
        treeSamples: true,
        calcs: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.plot.findUnique({
      where: { id },
      include: {
        treeSamples: true,
        calcs: true,
      },
    });
  }

  async update(id: string, updatePlotDto: UpdatePlotDto) {
    return this.prisma.plot.update({
      where: { id },
      data: updatePlotDto,
      include: {
        treeSamples: true,
        calcs: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.plot.delete({
      where: { id },
    });
  }
}
