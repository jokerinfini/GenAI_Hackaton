import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CalcService {
  private readonly calcUrl: string = 'http://calc:8000';

  async calculateAgroforestry(plotId: string, treeSamples: any[], plotAreaHa: number) {
    try {
      const payload = {
        trees: treeSamples.map(tree => ({
          dbh_cm: tree.dbh_cm,
          species: tree.species,
        })),
        plot_area_ha: plotAreaHa,
      };

      const response = await axios.post(`${this.calcUrl}/calculate/agroforestry`, payload);
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to calculate carbon credits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculateSOC(soilSamples: any[]) {
    try {
      const payload = {
        soilSamples: soilSamples.map(sample => ({
          bulkDensity: sample.bulkDensity,
          soilDepth: sample.soilDepth,
          carbonConcentration: sample.carbonConcentration,
          clayContent: sample.clayContent,
        })),
      };

      console.log('Sending SOC calculation request:', payload);
      const response = await axios.post(`${this.calcUrl}/calculate/vm0042/soc`, payload);
      console.log('SOC calculation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('SOC calculation error:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to calculate SOC stock',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculateRothC(climateData: any[], soilData: any, managementData: any[], simulationYears: number = 10) {
    try {
      const payload = {
        climateData: climateData.map(climate => ({
          month: climate.month,
          year: climate.year,
          meanTemperature: climate.meanTemperature,
          totalRainfall: climate.totalRainfall,
          evaporation: climate.evaporation,
        })),
        soilData: {
          bulkDensity: soilData.bulkDensity,
          soilDepth: soilData.soilDepth,
          carbonConcentration: soilData.carbonConcentration,
          clayContent: soilData.clayContent,
        },
        managementData: managementData.map(management => ({
          month: management.month,
          year: management.year,
          carbonInputs: management.carbonInputs,
          dpmRpmRatio: management.dpmRpmRatio,
          soilCover: management.soilCover,
          fertilizerN: management.fertilizerN,
          livestockPresent: management.livestockPresent,
        })),
        simulationYears,
      };

      const response = await axios.post(`${this.calcUrl}/calculate/vm0042/rothc`, payload);
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to run RothC simulation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculateBaselineEmissions(fertilizerN: number, livestockPresent: boolean, livestockCount: number = 0) {
    try {
      const payload = {
        fertilizerN,
        livestockPresent,
        livestockCount,
      };

      const response = await axios.post(`${this.calcUrl}/calculate/vm0042/baseline`, payload);
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to calculate baseline emissions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculateNetGHGBenefit(plotId: string, soilSamples: any[], climateData: any[], managementData: any[], baselineEmissions: any, simulationYears: number = 10) {
    try {
      const payload = {
        plotId,
        soilSamples: soilSamples.map(sample => ({
          bulkDensity: sample.bulkDensity,
          soilDepth: sample.soilDepth,
          carbonConcentration: sample.carbonConcentration,
          clayContent: sample.clayContent,
        })),
        climateData: climateData.map(climate => ({
          month: climate.month,
          year: climate.year,
          meanTemperature: climate.meanTemperature,
          totalRainfall: climate.totalRainfall,
          evaporation: climate.evaporation,
        })),
        managementData: managementData.map(management => ({
          month: management.month,
          year: management.year,
          carbonInputs: management.carbonInputs,
          dpmRpmRatio: management.dpmRpmRatio,
          soilCover: management.soilCover,
          fertilizerN: management.fertilizerN,
          livestockPresent: management.livestockPresent,
        })),
        baselineEmissions,
        simulationYears,
      };

      console.log('Sending Net GHG Benefit calculation request:', payload);
      const response = await axios.post(`${this.calcUrl}/calculate/vm0042/net-benefit`, payload);
      console.log('Net GHG Benefit calculation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Net GHG Benefit calculation error:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to calculate net GHG benefit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
