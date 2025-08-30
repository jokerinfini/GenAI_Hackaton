import { Controller, Post, Param } from '@nestjs/common';
import { CalcService } from '../services/calc.service';
import { PlotService } from '../services/plot.service';
import { PrismaService } from '../services/prisma.service';

@Controller('calc')
export class CalcController {
  constructor(
    private readonly calcService: CalcService,
    private readonly plotService: PlotService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':plotId/agroforestry')
  async calculateAgroforestry(@Param('plotId') plotId: string) {
    // Fetch plot details and tree samples
    const plot = await this.plotService.findOne(plotId);
    if (!plot) {
      throw new Error('Plot not found');
    }

    if (plot.treeSamples.length === 0) {
      throw new Error('No tree samples found for this plot');
    }

    // Call calculation service
    const calcResult = await this.calcService.calculateAgroforestry(
      plotId,
      plot.treeSamples,
      plot.areaHa,
    );

    // Save calculation result to database
    const creditCalc = await this.prisma.creditCalc.create({
      data: {
        plotId,
        method: 'agroforestry',
        inputs: calcResult.inputs,
        outputs: calcResult.intermediates,
        total_tCO2e: calcResult.total_co2e_tonnes,
      },
    });

    return {
      ...creditCalc,
      calculation_details: calcResult,
    };
  }
}
