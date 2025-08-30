import React, { useState, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';

interface Farmer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plots: Plot[];
}

interface Plot {
  id: string;
  name: string;
  geometry: any;
  areaHa: number;
  treeSamples: TreeSample[];
  calcs: CreditCalc[];
}

interface TreeSample {
  id: string;
  species?: string;
  dbh_cm: number;
  createdAt: string;
}

interface CreditCalc {
  id: string;
  method: string;
  total_tCO2e: number;
  createdAt: string;
}

export default function Home() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<string>('');
  const [showCreatePlot, setShowCreatePlot] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  const [newPlotArea, setNewPlotArea] = useState('');
  const [drawnPolygon, setDrawnPolygon] = useState<any>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await fetch(`${API_URL}/farmers`);
      const data = await response.json();
      setFarmers(data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const createFarmer = async () => {
    const name = prompt('Enter farmer name:');
    if (!name) return;

    try {
      const response = await fetch(`${API_URL}/farmers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const newFarmer = await response.json();
      setFarmers([...farmers, newFarmer]);
      setSelectedFarmer(newFarmer.id);
    } catch (error) {
      console.error('Error creating farmer:', error);
    }
  };

  const createPlot = async () => {
    if (!selectedFarmer || !drawnPolygon || !newPlotName || !newPlotArea) {
      alert('Please select a farmer, draw a polygon, and fill in plot details');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/plots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlotName,
          farmerId: selectedFarmer,
          geometry: drawnPolygon,
          areaHa: parseFloat(newPlotArea),
        }),
      });
      const newPlot = await response.json();
      setShowCreatePlot(false);
      setNewPlotName('');
      setNewPlotArea('');
      setDrawnPolygon(null);
      fetchFarmers(); // Refresh to get updated data
    } catch (error) {
      console.error('Error creating plot:', error);
    }
  };

  const calculateCredits = async (plotId: string) => {
    try {
      const response = await fetch(`${API_URL}/calc/${plotId}/agroforestry`, {
        method: 'POST',
      });
      const result = await response.json();
      alert(`Calculation complete! Total credits: ${result.total_tCO2e.toFixed(2)} tCO₂e`);
      fetchFarmers(); // Refresh to get updated data
    } catch (error) {
      console.error('Error calculating credits:', error);
      alert('Error calculating credits. Make sure the plot has tree samples.');
    }
  };

  const generateReport = (farmerId: string) => {
    window.open(`${API_URL}/reports/project/${farmerId}`, '_blank');
  };

  const mapStyle = {
    version: 8,
    sources: {
      'osm': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };

  const plotLayer = {
    id: 'plots',
    type: 'fill',
    paint: {
      'fill-color': '#088',
      'fill-opacity': 0.4,
      'fill-outline-color': '#000',
    },
  };

  const plotOutlineLayer = {
    id: 'plots-outline',
    type: 'line',
    paint: {
      'line-color': '#000',
      'line-width': 2,
    },
  };

  const allPlots = farmers.flatMap(farmer => farmer.plots);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: '0 0 16px 0' }}>MRV-in-a-Box Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={createFarmer} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Create Farmer
          </button>
          
          <select 
            value={selectedFarmer} 
            onChange={(e) => setSelectedFarmer(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Select a farmer</option>
            {farmers.map(farmer => (
              <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
            ))}
          </select>
          
          {selectedFarmer && (
            <button 
              onClick={() => setShowCreatePlot(true)}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Create Plot
            </button>
          )}
          
          {selectedFarmer && (
            <button 
              onClick={() => generateReport(selectedFarmer)}
              style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Generate Report
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Map
            mapLib={import('maplibre-gl')}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
            center={[0, 0]}
            zoom={2}
          >
            <NavigationControl position="top-right" />
            
            {allPlots.map(plot => (
              <Source key={plot.id} id={`plot-${plot.id}`} type="geojson" data={plot.geometry}>
                <Layer {...plotLayer} />
                <Layer {...plotOutlineLayer} />
              </Source>
            ))}
          </Map>
        </div>

        <div style={{ width: '400px', padding: '16px', overflowY: 'auto', borderLeft: '1px solid #ddd' }}>
          <h3>Plots</h3>
          {selectedFarmer && farmers.find(f => f.id === selectedFarmer)?.plots.map(plot => (
            <div key={plot.id} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h4>{plot.name}</h4>
              <p>Area: {plot.areaHa} ha</p>
              <p>Trees: {plot.treeSamples.length}</p>
              <p>Calculations: {plot.calcs.length}</p>
              {plot.calcs.length > 0 && (
                <p>Latest: {plot.calcs[0].total_tCO2e.toFixed(2)} tCO₂e</p>
              )}
              <button 
                onClick={() => calculateCredits(plot.id)}
                style={{ padding: '4px 8px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
              >
                Calculate Credits
              </button>
              <button 
                onClick={() => setSelectedPlot(plot)}
                style={{ padding: '4px 8px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {showCreatePlot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', minWidth: '300px' }}>
            <h3>Create New Plot</h3>
            <p>Draw a polygon on the map, then fill in the details below:</p>
            <input
              type="text"
              placeholder="Plot name"
              value={newPlotName}
              onChange={(e) => setNewPlotName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Area (hectares)"
              value={newPlotArea}
              onChange={(e) => setNewPlotArea(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={createPlot}
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Create Plot
              </button>
              <button 
                onClick={() => setShowCreatePlot(false)}
                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPlot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>{selectedPlot.name} - Details</h3>
            <p>Area: {selectedPlot.areaHa} hectares</p>
            
            <h4>Tree Samples ({selectedPlot.treeSamples.length})</h4>
            {selectedPlot.treeSamples.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Species</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>DBH (cm)</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlot.treeSamples.map(tree => (
                    <tr key={tree.id}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tree.species || 'Unknown'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tree.dbh_cm}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(tree.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No tree samples yet. Use the mobile app to add tree data.</p>
            )}
            
            <h4>Calculations ({selectedPlot.calcs.length})</h4>
            {selectedPlot.calcs.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Method</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Credits (tCO₂e)</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlot.calcs.map(calc => (
                    <tr key={calc.id}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{calc.method}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{calc.total_tCO2e.toFixed(2)}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(calc.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No calculations performed yet.</p>
            )}
            
            <button 
              onClick={() => setSelectedPlot(null)}
              style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
