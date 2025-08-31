import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateManagementPracticeDto, UpdateManagementPracticeDto } from '../dto/management-practice.dto';

@Injectable()
export class ManagementPracticeService {
  constructor(private prisma: PrismaService) {}

  async create(createManagementPracticeDto: CreateManagementPracticeDto) {
    return this.prisma.managementPractice.create({
      data: createManagementPracticeDto,
    });
  }

  async createMany(plotId: string, practices: Omit<CreateManagementPracticeDto, 'plotId'>[]) {
    const managementData = practices.map(practice => ({
      ...practice,
      plotId,
    }));

    return this.prisma.managementPractice.createMany({
      data: managementData,
    });
  }

  async findAll() {
    return this.prisma.managementPractice.findMany();
  }

  async findByPlotId(plotId: string) {
    return this.prisma.managementPractice.findMany({
      where: { plotId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByPlotIdAndYear(plotId: string, year: number) {
    return this.prisma.managementPractice.findMany({
      where: { 
        plotId,
        year,
      },
      orderBy: { month: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.managementPractice.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateManagementPracticeDto: UpdateManagementPracticeDto) {
    return this.prisma.managementPractice.update({
      where: { id },
      data: updateManagementPracticeDto,
    });
  }

  async remove(id: string) {
    return this.prisma.managementPractice.delete({
      where: { id },
    });
  }

  async getAnnualSummary(plotId: string, year: number) {
    const practices = await this.findByPlotIdAndYear(plotId, year);
    
    if (practices.length === 0) {
      return null;
    }

    return {
      totalCarbonInputs: practices.reduce((sum, p) => sum + p.carbonInputs, 0),
      averageDpmRpmRatio: practices.reduce((sum, p) => sum + p.dpmRpmRatio, 0) / practices.length,
      totalFertilizerN: practices.reduce((sum, p) => sum + p.fertilizerN, 0),
      soilCoverMonths: practices.filter(p => p.soilCover).length,
      livestockPresent: practices.some(p => p.livestockPresent)
    };
  }
}
