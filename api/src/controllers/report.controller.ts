import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PlotService } from '../services/plot.service';
import { FarmerService } from '../services/farmer.service';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly plotService: PlotService,
    private readonly farmerService: FarmerService,
  ) {}

  @Get('project/:farmerId')
  async generateProjectReport(@Param('farmerId') farmerId: string, @Res() res: Response) {
    const farmer = await this.farmerService.findOne(farmerId);
    if (!farmer) {
      return res.status(404).send('Farmer not found');
    }

    const html = this.generateHTMLReport(farmer);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  private generateHTMLReport(farmer: any): string {
    const totalPlots = farmer.plots.length;
    const totalTrees = farmer.plots.reduce((sum: number, plot: any) => 
      sum + plot.treeSamples.length, 0);
    const totalCredits = farmer.plots.reduce((sum: number, plot: any) => 
      sum + plot.calcs.reduce((calcSum: number, calc: any) => calcSum + calc.total_tCO2e, 0), 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>MRV Report - ${farmer.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2c5aa0; color: white; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .plot { margin: 10px 0; padding: 10px; background: #f9f9f9; }
        .calculation { background: #e8f4f8; padding: 10px; margin: 10px 0; }
        .formula { font-family: monospace; background: #f0f0f0; padding: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MRV-in-a-Box Project Report</h1>
        <h2>Farmer: ${farmer.name}</h2>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h3>Project Summary</h3>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Plots</td><td>${totalPlots}</td></tr>
            <tr><td>Total Trees Sampled</td><td>${totalTrees}</td></tr>
            <tr><td>Total Carbon Credits (tCO₂e)</td><td>${totalCredits.toFixed(2)}</td></tr>
        </table>
    </div>

    ${farmer.plots.map((plot: any) => `
    <div class="section">
        <h3>Plot: ${plot.name}</h3>
        <p><strong>Area:</strong> ${plot.areaHa} hectares</p>
        <p><strong>Trees Sampled:</strong> ${plot.treeSamples.length}</p>
        
        <h4>Tree Samples</h4>
        <table>
            <tr><th>Species</th><th>DBH (cm)</th><th>Date</th></tr>
            ${plot.treeSamples.map((tree: any) => `
                <tr>
                    <td>${tree.species || 'Unknown'}</td>
                    <td>${tree.dbh_cm}</td>
                    <td>${new Date(tree.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </table>

        ${plot.calcs.length > 0 ? `
        <h4>Carbon Calculations</h4>
        ${plot.calcs.map((calc: any) => `
        <div class="calculation">
            <p><strong>Method:</strong> ${calc.method}</p>
            <p><strong>Total Credits:</strong> ${calc.total_tCO2e.toFixed(2)} tCO₂e</p>
            <p><strong>Calculation Date:</strong> ${new Date(calc.createdAt).toLocaleDateString()}</p>
            
            <h5>Formula Used:</h5>
            <div class="formula">
                AGB_kg = a × (DBH_cm^b)<br>
                Where: a = 0.0673, b = 2.84<br>
                Belowground Biomass = AGB × 0.24<br>
                Total Carbon = Total Biomass × 0.47<br>
                CO₂e = Carbon × 3.67
            </div>
            
            <h5>Intermediate Values:</h5>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Total AGB (kg)</td><td>${calc.outputs.total_agb_kg?.toFixed(2) || 'N/A'}</td></tr>
                <tr><td>Belowground Biomass (kg)</td><td>${calc.outputs.belowground_biomass_kg?.toFixed(2) || 'N/A'}</td></tr>
                <tr><td>Total Biomass (kg)</td><td>${calc.outputs.total_biomass_kg?.toFixed(2) || 'N/A'}</td></tr>
                <tr><td>Total Carbon (kg)</td><td>${calc.outputs.total_carbon_kg?.toFixed(2) || 'N/A'}</td></tr>
            </table>
        </div>
        `).join('')}
        ` : '<p><em>No calculations performed yet</em></p>'}
    </div>
    `).join('')}

    <div class="section">
        <h3>Methodology</h3>
        <p>This report uses the generic tropical allometric equation for aboveground biomass estimation:</p>
        <div class="formula">
            AGB_kg = 0.0673 × (DBH_cm^2.84)
        </div>
        <p>The calculation includes:</p>
        <ul>
            <li>Aboveground biomass estimation using DBH measurements</li>
            <li>Belowground biomass estimation (24% of aboveground)</li>
            <li>Carbon content (47% of total biomass)</li>
            <li>CO₂ equivalent conversion (3.67 kg CO₂ per kg carbon)</li>
        </ul>
    </div>
</body>
</html>
    `;
  }
}
