import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateSoilSampleDto, UpdateSoilSampleDto } from '../dto/soil-sample.dto';

@Injectable()
export class SoilSampleService {
  constructor(private prisma: PrismaService) {}

  async create(createSoilSampleDto: CreateSoilSampleDto) {
    return this.prisma.soilSample.create({
      data: createSoilSampleDto,
    });
  }

  async findAll() {
    return this.prisma.soilSample.findMany();
  }

  async findByPlotId(plotId: string) {
    return this.prisma.soilSample.findMany({
      where: { plotId },
      orderBy: { samplingDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.soilSample.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateSoilSampleDto: UpdateSoilSampleDto) {
    return this.prisma.soilSample.update({
      where: { id },
      data: updateSoilSampleDto,
    });
  }

  async remove(id: string) {
    return this.prisma.soilSample.delete({
      where: { id },
    });
  }

  async getLatestByPlotId(plotId: string) {
    return this.prisma.soilSample.findFirst({
      where: { plotId },
      orderBy: { samplingDate: 'desc' },
    });
  }
}
