import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Plot {
  id: string;
  name: string;
  areaHa: number;
  soilSamples: any[];
  climateData: any[];
  managementPractices: any[];
  calcs: any[];
}

interface Farmer {
  id: string;
  name: string;
  plots: Plot[];
}

export default function VM0042Dashboard() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<string>('');
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const router = useRouter();

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await fetch(`${API_URL}/farmers`);
      const data = await response.json();
      // Ensure all farmers have the plots property
      const farmersWithPlots = data.map((farmer: any) => ({
        ...farmer,
        plots: farmer.plots || []
      }));
      setFarmers(farmersWithPlots);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const fetchPlotDetails = async (plotId: string) => {
    try {
      const [soilResponse, climateResponse, managementResponse] = await Promise.all([
        fetch(`${API_URL}/soil-samples/plot/${plotId}`),
        fetch(`${API_URL}/climate-data/plot/${plotId}`),
        fetch(`${API_URL}/management-practices/plot/${plotId}`),
      ]);

      const soilSamples = await soilResponse.json();
      const climateData = await climateResponse.json();
      const managementPractices = await managementResponse.json();

      const plot = farmers
        .flatMap(f => f.plots)
        .find(p => p.id === plotId);

      if (plot) {
        setSelectedPlot({
          ...plot,
          soilSamples,
          climateData,
          managementPractices,
        });
      }
    } catch (error) {
      console.error('Error fetching plot details:', error);
    }
  };

  const calculateVM0042SOC = async (plotId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/calc/vm0042/${plotId}/soc`, {
        method: 'POST',
      });
      const result = await response.json();
      setCalculationResult(result);
      alert(`Success: SOC Calculation Complete: ${result.total_tCO2e.toFixed(2)} tCO₂e`);
    } catch (error) {
      console.error('Error calculating SOC:', error);
      alert('Error: Failed to calculate SOC. Make sure the plot has soil samples.');
    } finally {
      setLoading(false);
    }
  };

  const calculateVM0042RothC = async (plotId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/calc/vm0042/${plotId}/rothc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationYears: 10 }),
      });
      const result = await response.json();
      setCalculationResult(result);
      alert(`Success: RothC Simulation Complete: ${result.total_tCO2e.toFixed(2)} tCO₂e`);
    } catch (error) {
      console.error('Error running RothC simulation:', error);
      alert('Error: Failed to run RothC simulation. Check data completeness.');
    } finally {
      setLoading(false);
    }
  };

  const calculateVM0042NetBenefit = async (plotId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/calc/vm0042/${plotId}/net-benefit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationYears: 10,
          baselineEmissions: {
            fertilizerN: 100, // kg N/ha/year
            livestockPresent: false,
            livestockCount: 0,
          },
        }),
      });
      const result = await response.json();
      setCalculationResult(result);
      alert(`Success: Net GHG Benefit: ${result.total_tCO2e.toFixed(2)} tCO₂e`);
    } catch (error) {
      console.error('Error calculating net GHG benefit:', error);
      alert('Error: Failed to calculate net GHG benefit.');
    } finally {
      setLoading(false);
    }
  };

  const selectedFarmerData = farmers.find(f => f.id === selectedFarmer);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c5aa0', marginBottom: '10px' }}>VM0042 Carbon Credit Dashboard</h1>
        <p style={{ color: '#666' }}>
          Verra VM0042 Methodology for Improved Agricultural Land Management
        </p>
      </div>

      {/* Farmer Selection */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Select Farmer</h3>
        <select
          value={selectedFarmer}
          onChange={(e) => setSelectedFarmer(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', width: '300px' }}
        >
          <option value="">Choose a farmer...</option>
          {farmers.map(farmer => (
            <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
          ))}
        </select>
      </div>

      {selectedFarmerData && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Plots for {selectedFarmerData.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {selectedFarmerData.plots && selectedFarmerData.plots.length > 0 ? (
              selectedFarmerData.plots.map(plot => (
              <div key={plot.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <h4>{plot.name}</h4>
                <p>Area: {plot.areaHa} hectares</p>
                
                <div style={{ marginBottom: '15px' }}>
                  <button
                    onClick={() => fetchPlotDetails(plot.id)}
                    style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', marginRight: '8px' }}
                  >
                    View Details
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => calculateVM0042SOC(plot.id)}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    {loading ? 'Calculating...' : 'Calculate SOC'}
                  </button>
                  
                  <button
                    onClick={() => calculateVM0042RothC(plot.id)}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
                  >
                    {loading ? 'Running...' : 'Run RothC Simulation'}
                  </button>
                  
                  <button
                    onClick={() => calculateVM0042NetBenefit(plot.id)}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    {loading ? 'Calculating...' : 'Calculate Net GHG Benefit'}
                  </button>
                </div>
              </div>
            ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No plots available for this farmer. Create plots in the main dashboard first.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plot Details Modal */}
      {selectedPlot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>{selectedPlot.name} - VM0042 Data</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4>Soil Samples ({selectedPlot.soilSamples.length})</h4>
              {selectedPlot.soilSamples.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Depth (cm)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Organic C (%)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Bulk Density</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Clay Content (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPlot.soilSamples.map((sample: any, index: number) => (
                      <tr key={index}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sample.soilDepth}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sample.carbonConcentration}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sample.bulkDensity}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sample.clayContent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No soil samples available</p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>Climate Data ({selectedPlot.climateData.length})</h4>
              {selectedPlot.climateData.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Month/Year</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Temperature (°C)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rainfall (mm)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Evaporation (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPlot.climateData.slice(0, 12).map((climate: any, index: number) => (
                      <tr key={index}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{climate.month}/{climate.year}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{climate.meanTemperature}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{climate.totalRainfall}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{climate.evaporation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No climate data available</p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>Management Practices ({selectedPlot.managementPractices.length})</h4>
              {selectedPlot.managementPractices.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Month/Year</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Carbon Inputs (t C/ha)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Fertilizer N (kg/ha)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Soil Cover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPlot.managementPractices.slice(0, 12).map((practice: any, index: number) => (
                      <tr key={index}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{practice.month}/{practice.year}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{practice.carbonInputs}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{practice.fertilizerN}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{practice.soilCover ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No management practices available</p>
              )}
            </div>

            <button
              onClick={() => setSelectedPlot(null)}
              style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Calculation Results */}
      {calculationResult && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Latest Calculation Result</h3>
          <pre style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(calculationResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/')}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Back to Main Dashboard
        </button>
      </div>
    </div>
  );
}
