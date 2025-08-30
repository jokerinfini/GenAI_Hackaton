import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { FarmerController } from './controllers/farmer.controller';
import { PlotController } from './controllers/plot.controller';
import { TreeSampleController } from './controllers/tree-sample.controller';
import { CalcController } from './controllers/calc.controller';
import { ReportController } from './controllers/report.controller';
import { FarmerService } from './services/farmer.service';
import { PlotService } from './services/plot.service';
import { TreeSampleService } from './services/tree-sample.service';
import { CalcService } from './services/calc.service';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [
    HealthController,
    FarmerController,
    PlotController,
    TreeSampleController,
    CalcController,
    ReportController,
  ],
  providers: [
    FarmerService,
    PlotService,
    TreeSampleService,
    CalcService,
    PrismaService,
  ],
})
export class AppModule {}
