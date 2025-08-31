import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTreeSampleDto, UpdateTreeSampleDto } from '../dto/tree-sample.dto';

@Injectable()
export class TreeSampleService {
  constructor(private prisma: PrismaService) {}

  async create(createTreeSampleDto: CreateTreeSampleDto) {
    return this.prisma.treeSample.create({
      data: createTreeSampleDto,
    });
  }

  async createMany(plotId: string, trees: any[]) {
    if (!trees || !Array.isArray(trees)) {
      throw new Error('Trees must be an array');
    }
    
    const treeData = trees.map(tree => ({
      plotId,
      species: tree.species || null,
      dbh_cm: tree.dbh_cm,
    }));

    return this.prisma.treeSample.createMany({
      data: treeData,
    });
  }

  async findAll() {
    return this.prisma.treeSample.findMany();
  }

  async findByPlotId(plotId: string) {
    return this.prisma.treeSample.findMany({
      where: { plotId },
    });
  }

  async findOne(id: string) {
    return this.prisma.treeSample.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateTreeSampleDto: UpdateTreeSampleDto) {
    return this.prisma.treeSample.update({
      where: { id },
      data: updateTreeSampleDto,
    });
  }

  async remove(id: string) {
    return this.prisma.treeSample.delete({
      where: { id },
    });
  }
}
