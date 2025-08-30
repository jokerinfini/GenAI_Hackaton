import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreatePlotDto } from '../dto/plot.dto';

@Injectable()
export class PlotService {
  constructor(private prisma: PrismaService) {}

  async create(createPlotDto: CreatePlotDto) {
    return this.prisma.plot.create({
      data: createPlotDto,
      include: {
        farmer: true,
      },
    });
  }

  async findAll() {
    return this.prisma.plot.findMany({
      include: {
        farmer: true,
        treeSamples: true,
        calcs: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.plot.findUnique({
      where: { id },
      include: {
        farmer: true,
        treeSamples: true,
        calcs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
}
