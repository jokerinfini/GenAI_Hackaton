import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateClimateDataDto, UpdateClimateDataDto } from '../dto/climate-data.dto';

@Injectable()
export class ClimateDataService {
  constructor(private prisma: PrismaService) {}

  async create(createClimateDataDto: CreateClimateDataDto) {
    return this.prisma.climateData.create({
      data: createClimateDataDto,
    });
  }

  async createMany(plotId: string, data: Omit<CreateClimateDataDto, 'plotId'>[]) {
    const climateData = data.map(item => ({
      ...item,
      plotId,
    }));

    return this.prisma.climateData.createMany({
      data: climateData,
    });
  }

  async findAll() {
    return this.prisma.climateData.findMany();
  }

  async findByPlotId(plotId: string) {
    return this.prisma.climateData.findMany({
      where: { plotId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByPlotIdAndYear(plotId: string, year: number) {
    return this.prisma.climateData.findMany({
      where: { 
        plotId,
        year,
      },
      orderBy: { month: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.climateData.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateClimateDataDto: UpdateClimateDataDto) {
    return this.prisma.climateData.update({
      where: { id },
      data: updateClimateDataDto,
    });
  }

  async remove(id: string) {
    return this.prisma.climateData.delete({
      where: { id },
    });
  }

  async getMonthlyAverages(plotId: string, startYear: number, endYear: number) {
    const data = await this.prisma.climateData.findMany({
      where: { 
        plotId,
        year: {
          gte: startYear,
          lte: endYear,
        },
      },
    });

    const monthlyData = {};
    
    for (let month = 1; month <= 12; month++) {
      const monthData = data.filter(d => d.month === month);
      if (monthData.length > 0) {
        monthlyData[month] = {
          meanTemperature: monthData.reduce((sum, d) => sum + d.meanTemperature, 0) / monthData.length,
          totalRainfall: monthData.reduce((sum, d) => sum + d.totalRainfall, 0),
          evaporation: monthData.reduce((sum, d) => sum + d.evaporation, 0) / monthData.length
        };
      }
    }
    
    return monthlyData;
  }
}
