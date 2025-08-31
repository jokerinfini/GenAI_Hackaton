import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { useRouter } from 'next/router';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const router = useRouter();

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [0, 0],
        zoom: 2
      });

      map.current.addControl(new maplibregl.NavigationControl());

      // Add drawing functionality
      let isDrawing = false;
      let coordinates: number[][] = [];

      map.current.on('click', (e) => {
        if (!showCreatePlot) return;
        
        if (!isDrawing) {
          isDrawing = true;
          coordinates = [];
        }

        coordinates.push([e.lngLat.lng, e.lngLat.lat]);

        // Add point marker
        const pointId = `point-${Date.now()}`;
        map.current!.addSource(pointId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [e.lngLat.lng, e.lngLat.lat]
            }
          }
        });

        map.current!.addLayer({
          id: pointId,
          type: 'circle',
          source: pointId,
          paint: {
            'circle-radius': 6,
            'circle-color': '#007cbf'
          }
        });

        // If we have 3 or more points, create polygon
        if (coordinates.length >= 3) {
          // Ensure polygon is closed (first and last points are the same)
          const closedCoordinates = [...coordinates];
          if (closedCoordinates.length > 0) {
            const firstPoint = closedCoordinates[0];
            const lastPoint = closedCoordinates[closedCoordinates.length - 1];
            if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
              closedCoordinates.push(firstPoint);
            }
          }
          
          const polygon = turf.polygon([closedCoordinates]);
          setDrawnPolygon(polygon.geometry);
          
          // Remove previous polygon if exists
          if (map.current!.getSource('drawn-polygon')) {
            map.current!.removeLayer('drawn-polygon-fill');
            map.current!.removeLayer('drawn-polygon-outline');
            map.current!.removeSource('drawn-polygon');
          }

          // Add new polygon
          map.current!.addSource('drawn-polygon', {
            type: 'geojson',
            data: polygon
          });

          map.current!.addLayer({
            id: 'drawn-polygon-fill',
            type: 'fill',
            source: 'drawn-polygon',
            paint: {
              'fill-color': '#007cbf',
              'fill-opacity': 0.3
            }
          });

          map.current!.addLayer({
            id: 'drawn-polygon-outline',
            type: 'line',
            source: 'drawn-polygon',
            paint: {
              'line-color': '#007cbf',
              'line-width': 2
            }
          });
        }
      });

      // Double click to finish drawing
      map.current.on('dblclick', () => {
        if (isDrawing && coordinates.length >= 3) {
          isDrawing = false;
          // Ensure polygon is closed (first and last points are the same)
          const closedCoordinates = [...coordinates];
          if (closedCoordinates.length > 0) {
            const firstPoint = closedCoordinates[0];
            const lastPoint = closedCoordinates[closedCoordinates.length - 1];
            if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
              closedCoordinates.push(firstPoint);
            }
          }
          const polygon = turf.polygon([closedCoordinates]);
          setDrawnPolygon(polygon.geometry);
        }
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showCreatePlot]);

  const fetchFarmers = async () => {
    try {
      const response = await fetch(`${API_URL}/farmers`);
      const data = await response.json();
      console.log('Fetched farmers data:', data);
      // Ensure all farmers have the plots property and plots have required arrays
      const farmersWithPlots = data.map((farmer: any) => ({
        ...farmer,
        plots: (farmer.plots || []).map((plot: any) => ({
          ...plot,
          treeSamples: plot.treeSamples || [],
          calcs: plot.calcs || []
        }))
      }));
      console.log('Farmers with plots:', farmersWithPlots);
      setFarmers(farmersWithPlots);
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
      // Ensure the farmer has the plots property and plots have required arrays
      const farmerWithPlots = { 
        ...newFarmer, 
        plots: (newFarmer.plots || []).map((plot: any) => ({
          ...plot,
          treeSamples: plot.treeSamples || [],
          calcs: plot.calcs || []
        }))
      };
      setFarmers([...farmers, farmerWithPlots]);
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

    console.log('Creating plot with data:', {
      name: newPlotName,
      farmerId: selectedFarmer,
      geometry: drawnPolygon,
      areaHa: parseFloat(newPlotArea),
    });
    console.log('Selected farmer ID:', selectedFarmer);
    console.log('Available farmers:', farmers.map(f => ({ id: f.id, name: f.name })));

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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        alert(`Error creating plot: ${response.status} - ${errorText}`);
        return;
      }
      
      const newPlot = await response.json();
      console.log('Plot created successfully:', newPlot);
      
      setShowCreatePlot(false);
      setNewPlotName('');
      setNewPlotArea('');
      setDrawnPolygon(null);
      
      // Refresh to get updated data
      await fetchFarmers();
      
      alert('Plot created successfully!');
    } catch (error) {
      console.error('Error creating plot:', error);
      alert(`Error creating plot: ${error.message}`);
    }
  };

  const selectedFarmerData = farmers.find(f => f.id === selectedFarmer);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: '0' }}>MRV-in-a-Box Dashboard</h1>
        <button
          onClick={() => router.push('/vm0042')}
          style={{ padding: '10px 20px', backgroundColor: '#2c5aa0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          VM0042 Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', height: 'calc(100vh - 120px)' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Farmers Section */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ marginTop: '0' }}>Farmers</h3>
            <button
              onClick={createFarmer}
              style={{ width: '100%', padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginBottom: '12px' }}
            >
              Add New Farmer
            </button>
            <select
              value={selectedFarmer}
              onChange={(e) => setSelectedFarmer(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="">Select a farmer...</option>
              {farmers.map(farmer => (
                <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
              ))}
            </select>
          </div>

          {/* Plots Section */}
          {selectedFarmerData && (
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ marginTop: '0' }}>Plots</h3>
              <button
                onClick={() => setShowCreatePlot(true)}
                style={{ width: '100%', padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginBottom: '12px' }}
              >
                Add New Plot
              </button>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {selectedFarmerData.plots && selectedFarmerData.plots.length > 0 ? (
                  selectedFarmerData.plots.map(plot => (
                    <div
                      key={plot.id}
                      onClick={() => setSelectedPlot({
                        ...plot,
                        treeSamples: plot.treeSamples || [],
                        calcs: plot.calcs || []
                      })}
                      style={{
                        padding: '8px',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedPlot?.id === plot.id ? '#f0f8ff' : 'white'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{plot.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Area: {plot.areaHa} ha | Trees: {plot.treeSamples?.length || 0}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '8px', color: '#666', fontStyle: 'italic' }}>
                    No plots yet. Create your first plot!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plot Details */}
          {selectedPlot && (
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ marginTop: '0' }}>Plot Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <strong>Name:</strong> {selectedPlot.name}<br />
                <strong>Area:</strong> {selectedPlot.areaHa} hectares<br />
                <strong>Tree Samples:</strong> {selectedPlot.treeSamples?.length || 0}<br />
                <strong>Calculations:</strong> {selectedPlot.calcs?.length || 0}
              </div>
              <button
                onClick={() => window.open(`/mobile`, '_blank')}
                style={{ width: '100%', padding: '8px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Open Mobile App
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Map */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          {showCreatePlot && (
            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Create New Plot</h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Plot name"
                  value={newPlotName}
                  onChange={(e) => setNewPlotName(e.target.value)}
                  style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="number"
                  placeholder="Area (ha)"
                  value={newPlotArea}
                  onChange={(e) => setNewPlotArea(e.target.value)}
                  style={{ width: '100px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={createPlot}
                  style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Save Plot
                </button>
                <button
                  onClick={() => {
                    setShowCreatePlot(false);
                    setNewPlotName('');
                    setNewPlotArea('');
                    setDrawnPolygon(null);
                  }}
                  style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Cancel
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Click on the map to draw polygon points. Double-click to finish.
              </div>
            </div>
          )}
          <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
