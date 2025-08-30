import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTreeSampleDto } from '../dto/tree-sample.dto';

@Injectable()
export class TreeSampleService {
  constructor(private prisma: PrismaService) {}

  async createMany(plotId: string, trees: CreateTreeSampleDto[]) {
    const treeSamples = trees.map(tree => ({
      ...tree,
      plotId,
    }));

    return this.prisma.treeSample.createMany({
      data: treeSamples,
    });
  }

  async findByPlotId(plotId: string) {
    return this.prisma.treeSample.findMany({
      where: { plotId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
