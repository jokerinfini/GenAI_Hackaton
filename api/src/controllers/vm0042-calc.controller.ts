import { Controller, Post, Param, Body } from '@nestjs/common';
import { CalcService } from '../services/calc.service';
import { SoilSampleService } from '../services/soil-sample.service';
import { ClimateDataService } from '../services/climate-data.service';
import { ManagementPracticeService } from '../services/management-practice.service';
import { PrismaService } from '../services/prisma.service';

@Controller('calc/vm0042')
export class VM0042CalcController {
  constructor(
    private readonly calcService: CalcService,
    private readonly soilSampleService: SoilSampleService,
    private readonly climateDataService: ClimateDataService,
    private readonly managementPracticeService: ManagementPracticeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':plotId/soc')
  async calculateSOC(@Param('plotId') plotId: string) {
    const soilSamples = await this.soilSampleService.findByPlotId(plotId);
    
    if (soilSamples.length === 0) {
      throw new Error('No soil samples found for this plot');
    }

    const calcResult = await this.calcService.calculateSOC(soilSamples);

    // Save calculation result to database
    const creditCalc = await this.prisma.creditCalc.create({
      data: {
        plotId,
        method: 'vm0042_soc',
        inputs: { soilSamples },
        outputs: calcResult,
        total_tCO2e: calcResult.average_soc_tC_ha * 44 / 12, // Convert to CO2e
      },
    });

    return {
      ...creditCalc,
      calculation_details: calcResult,
    };
  }

  @Post(':plotId/rothc')
  async calculateRothC(
    @Param('plotId') plotId: string,
    @Body() body: { simulationYears?: number }
  ) {
    const soilSamples = await this.soilSampleService.findByPlotId(plotId);
    const climateData = await this.climateDataService.findByPlotId(plotId);
    const managementData = await this.managementPracticeService.findByPlotId(plotId);

    if (soilSamples.length === 0) {
      throw new Error('No soil samples found for this plot');
    }

    if (climateData.length === 0) {
      throw new Error('No climate data found for this plot');
    }

    if (managementData.length === 0) {
      throw new Error('No management data found for this plot');
    }

    const calcResult = await this.calcService.calculateRothC(
      climateData,
      soilSamples[0], // Use first soil sample as representative
      managementData,
      body.simulationYears || 10
    );

    // Save calculation result to database
    const creditCalc = await this.prisma.creditCalc.create({
      data: {
        plotId,
        method: 'vm0042_rothc',
        inputs: { soilSamples, climateData, managementData, simulationYears: body.simulationYears || 10 },
        outputs: calcResult,
        total_tCO2e: calcResult.result.total_soc_change_tC_ha * 44 / 12, // Convert to CO2e
      },
    });

    return {
      ...creditCalc,
      calculation_details: calcResult,
    };
  }

  @Post(':plotId/baseline')
  async calculateBaselineEmissions(
    @Param('plotId') plotId: string,
    @Body() body: { fertilizerN: number; livestockPresent: boolean; livestockCount?: number }
  ) {
    const calcResult = await this.calcService.calculateBaselineEmissions(
      body.fertilizerN,
      body.livestockPresent,
      body.livestockCount || 0
    );

    // Save calculation result to database
    const creditCalc = await this.prisma.creditCalc.create({
      data: {
        plotId,
        method: 'vm0042_baseline',
        inputs: body,
        outputs: calcResult,
        total_tCO2e: calcResult.total_emissions_tCO2e,
      },
    });

    return {
      ...creditCalc,
      calculation_details: calcResult,
    };
  }

  @Post(':plotId/net-benefit')
  async calculateNetGHGBenefit(
    @Param('plotId') plotId: string,
    @Body() body: { simulationYears?: number }
  ) {
    const soilSamples = await this.soilSampleService.findByPlotId(plotId);
    const climateData = await this.climateDataService.findByPlotId(plotId);
    const managementData = await this.managementPracticeService.findByPlotId(plotId);

    if (soilSamples.length === 0) {
      throw new Error('No soil samples found for this plot');
    }

    if (climateData.length === 0) {
      throw new Error('No climate data found for this plot');
    }

    if (managementData.length === 0) {
      throw new Error('No management data found for this plot');
    }

    // Mock baseline emissions for now
    const baselineEmissions = {
      fertilizerN: 100,
      livestockPresent: false,
      livestockCount: 0,
    };

    const calcResult = await this.calcService.calculateNetGHGBenefit(
      plotId,
      soilSamples,
      climateData,
      managementData,
      baselineEmissions,
      body.simulationYears || 10
    );

    // Save calculation result to database
    const creditCalc = await this.prisma.creditCalc.create({
      data: {
        plotId,
        method: 'vm0042_net_benefit',
        inputs: { soilSamples, climateData, managementData, baselineEmissions, simulationYears: body.simulationYears || 10 },
        outputs: calcResult,
        total_tCO2e: calcResult.net_ghg_benefit_tCO2e || calcResult.total_ghg_benefit_tCO2e || calcResult.ghg_benefit_tCO2e || 0,
      },
    });

    return {
      ...creditCalc,
      calculation_details: calcResult,
    };
  }
}
