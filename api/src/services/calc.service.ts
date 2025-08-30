import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CalcService {
  private readonly calcUrl: string;

  constructor(private configService: ConfigService) {
    this.calcUrl = this.configService.get<string>('CALC_URL');
  }

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
}
