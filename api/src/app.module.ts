import { Module } from '@nestjs/common';
import { FarmerController } from './controllers/farmer.controller';
import { PlotController } from './controllers/plot.controller';
import { TreeSampleController } from './controllers/tree-sample.controller';
import { CalcController } from './controllers/calc.controller';
import { ReportController } from './controllers/report.controller';
import { HealthController } from './health.controller';
import { SoilSampleController } from './controllers/soil-sample.controller';
import { ClimateDataController } from './controllers/climate-data.controller';
import { ManagementPracticeController } from './controllers/management-practice.controller';
import { VM0042CalcController } from './controllers/vm0042-calc.controller';

import { FarmerService } from './services/farmer.service';
import { PlotService } from './services/plot.service';
import { TreeSampleService } from './services/tree-sample.service';
import { CalcService } from './services/calc.service';
import { PrismaService } from './services/prisma.service';
import { SoilSampleService } from './services/soil-sample.service';
import { ClimateDataService } from './services/climate-data.service';
import { ManagementPracticeService } from './services/management-practice.service';

@Module({
  imports: [],
  controllers: [
    FarmerController,
    PlotController,
    TreeSampleController,
    CalcController,
    ReportController,
    HealthController,
    SoilSampleController,
    ClimateDataController,
    ManagementPracticeController,
    VM0042CalcController,
  ],
  providers: [
    FarmerService,
    PlotService,
    TreeSampleService,
    CalcService,
    PrismaService, // Re-enabled for real database
    SoilSampleService,
    ClimateDataService,
    ManagementPracticeService,
  ],
})
export class AppModule {}
