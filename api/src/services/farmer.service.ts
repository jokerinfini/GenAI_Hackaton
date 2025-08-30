import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateFarmerDto } from '../dto/farmer.dto';

@Injectable()
export class FarmerService {
  constructor(private prisma: PrismaService) {}

  async create(createFarmerDto: CreateFarmerDto) {
    return this.prisma.farmer.create({
      data: createFarmerDto,
    });
  }

  async findAll() {
    return this.prisma.farmer.findMany({
      include: {
        plots: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.farmer.findUnique({
      where: { id },
      include: {
        plots: {
          include: {
            treeSamples: true,
            calcs: true,
          },
        },
      },
    });
  }
}
