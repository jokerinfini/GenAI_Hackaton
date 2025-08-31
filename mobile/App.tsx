import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced interfaces for VM0042 data collection
interface TreeSample {
  id: string;
  species: string;
  dbh_cm: number;
  plotId: string;
  createdAt: string;
  synced: boolean;
}

interface SoilSample {
  id: string;
  plotId: string;
  depth_cm: number;
  organic_carbon_percent: number;
  bulk_density_g_cm3: number;
  ph_value: number;
  sampleDate: string;
  synced: boolean;
}

interface ClimateData {
  id: string;
  plotId: string;
  temperature_celsius: number;
  humidity_percent: number;
  rainfall_mm: number;
  wind_speed_m_s: number;
  measurementDate: string;
  synced: boolean;
}

interface ManagementPractice {
  id: string;
  plotId: string;
  practiceType: 'irrigation' | 'fertilization' | 'pruning' | 'pest_control' | 'harvesting';
  description: string;
  date: string;
  synced: boolean;
}

type DataType = 'trees' | 'soil' | 'climate' | 'management';

const API_URL = 'http://localhost:3001';

export default function App(): JSX.Element {
  // State for different data types
  const [activeTab, setActiveTab] = useState<DataType>('trees');
  
  // Tree sample state
  const [plotId, setPlotId] = useState('');
  const [species, setSpecies] = useState('');
  const [dbh, setDbh] = useState('');
  const [treeSamples, setTreeSamples] = useState<TreeSample[]>([]);
  
  // Soil sample state
  const [soilPlotId, setSoilPlotId] = useState('');
  const [depth, setDepth] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');
  const [bulkDensity, setBulkDensity] = useState('');
  const [phValue, setPhValue] = useState('');
  const [soilSamples, setSoilSamples] = useState<SoilSample[]>([]);
  
  // Climate data state
  const [climatePlotId, setClimatePlotId] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  
  // Management practice state
  const [managementPlotId, setManagementPlotId] = useState('');
  const [practiceType, setPracticeType] = useState<ManagementPractice['practiceType']>('irrigation');
  const [practiceDescription, setPracticeDescription] = useState('');
  const [managementPractices, setManagementPractices] = useState<ManagementPractice[]>([]);
  
  // General state
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [treeData, soilData, climateData, managementData] = await Promise.all([
        AsyncStorage.getItem('treeSamples'),
        AsyncStorage.getItem('soilSamples'),
        AsyncStorage.getItem('climateData'),
        AsyncStorage.getItem('managementPractices'),
      ]);
      
      if (treeData) setTreeSamples(JSON.parse(treeData));
      if (soilData) setSoilSamples(JSON.parse(soilData));
      if (climateData) setClimateData(JSON.parse(climateData));
      if (managementData) setManagementPractices(JSON.parse(managementData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (key: string, data: any[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Tree sample functions
  const addTreeSample = async () => {
    if (!plotId.trim() || !species.trim() || !dbh.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const dbhValue = parseFloat(dbh);
    if (isNaN(dbhValue) || dbhValue <= 0) {
      Alert.alert('Error', 'Please enter a valid DBH value');
      return;
    }

    const newSample: TreeSample = {
      id: Date.now().toString(),
      species: species.trim(),
      dbh_cm: dbhValue,
      plotId: plotId.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    const updatedSamples = [...treeSamples, newSample];
    await saveData('treeSamples', updatedSamples);
    setTreeSamples(updatedSamples);

    setSpecies('');
    setDbh('');
    Alert.alert('Success', 'Tree sample added successfully!');
  };

  // Soil sample functions
  const addSoilSample = async () => {
    if (!soilPlotId.trim() || !depth.trim() || !organicCarbon.trim() || !bulkDensity.trim() || !phValue.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const depthValue = parseFloat(depth);
    const organicCarbonValue = parseFloat(organicCarbon);
    const bulkDensityValue = parseFloat(bulkDensity);
    const phValueNum = parseFloat(phValue);

    if (isNaN(depthValue) || isNaN(organicCarbonValue) || isNaN(bulkDensityValue) || isNaN(phValueNum)) {
      Alert.alert('Error', 'Please enter valid numeric values');
      return;
    }

    const newSample: SoilSample = {
      id: Date.now().toString(),
      plotId: soilPlotId.trim(),
      depth_cm: depthValue,
      organic_carbon_percent: organicCarbonValue,
      bulk_density_g_cm3: bulkDensityValue,
      ph_value: phValueNum,
      sampleDate: new Date().toISOString(),
      synced: false,
    };

    const updatedSamples = [...soilSamples, newSample];
    await saveData('soilSamples', updatedSamples);
    setSoilSamples(updatedSamples);

    setDepth('');
    setOrganicCarbon('');
    setBulkDensity('');
    setPhValue('');
    Alert.alert('Success', 'Soil sample added successfully!');
  };

  // Climate data functions
  const addClimateData = async () => {
    if (!climatePlotId.trim() || !temperature.trim() || !humidity.trim() || !rainfall.trim() || !windSpeed.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const tempValue = parseFloat(temperature);
    const humidityValue = parseFloat(humidity);
    const rainfallValue = parseFloat(rainfall);
    const windSpeedValue = parseFloat(windSpeed);

    if (isNaN(tempValue) || isNaN(humidityValue) || isNaN(rainfallValue) || isNaN(windSpeedValue)) {
      Alert.alert('Error', 'Please enter valid numeric values');
      return;
    }

    const newData: ClimateData = {
      id: Date.now().toString(),
      plotId: climatePlotId.trim(),
      temperature_celsius: tempValue,
      humidity_percent: humidityValue,
      rainfall_mm: rainfallValue,
      wind_speed_m_s: windSpeedValue,
      measurementDate: new Date().toISOString(),
      synced: false,
    };

    const updatedData = [...climateData, newData];
    await saveData('climateData', updatedData);
    setClimateData(updatedData);

    setTemperature('');
    setHumidity('');
    setRainfall('');
    setWindSpeed('');
    Alert.alert('Success', 'Climate data added successfully!');
  };

  // Management practice functions
  const addManagementPractice = async () => {
    if (!managementPlotId.trim() || !practiceDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newPractice: ManagementPractice = {
      id: Date.now().toString(),
      plotId: managementPlotId.trim(),
      practiceType,
      description: practiceDescription.trim(),
      date: new Date().toISOString(),
      synced: false,
    };

    const updatedPractices = [...managementPractices, newPractice];
    await saveData('managementPractices', updatedPractices);
    setManagementPractices(updatedPractices);

    setPracticeDescription('');
    Alert.alert('Success', 'Management practice added successfully!');
  };

  // Sync functions
  const syncToServer = async () => {
    setSyncing(true);
    try {
      // Sync tree samples
      const unsyncedTrees = treeSamples.filter(sample => !sample.synced);
      if (unsyncedTrees.length > 0) {
        await syncTreeSamples(unsyncedTrees);
      }

      // Sync soil samples
      const unsyncedSoil = soilSamples.filter(sample => !sample.synced);
      if (unsyncedSoil.length > 0) {
        await syncSoilSamples(unsyncedSoil);
      }

      // Sync climate data
      const unsyncedClimate = climateData.filter(data => !data.synced);
      if (unsyncedClimate.length > 0) {
        await syncClimateData(unsyncedClimate);
      }

      // Sync management practices
      const unsyncedManagement = managementPractices.filter(practice => !practice.synced);
      if (unsyncedManagement.length > 0) {
        await syncManagementPractices(unsyncedManagement);
      }

      Alert.alert('Success', 'All data synced successfully!');
    } catch (error) {
      console.error('Error syncing to server:', error);
      Alert.alert('Error', 'Failed to sync with server');
    } finally {
      setSyncing(false);
    }
  };

  const syncTreeSamples = async (samples: TreeSample[]) => {
    const samplesByPlot = samples.reduce((acc, sample) => {
      if (!acc[sample.plotId]) acc[sample.plotId] = [];
      acc[sample.plotId].push(sample);
      return acc;
    }, {} as Record<string, TreeSample[]>);

    for (const [plotId, plotSamples] of Object.entries(samplesByPlot)) {
      const response = await fetch(`${API_URL}/plots/${plotId}/trees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId,
          trees: plotSamples.map(sample => ({
            species: sample.species,
            dbh_cm: sample.dbh_cm,
          })),
        }),
      });

      if (response.ok) {
        const updatedSamples = treeSamples.map(sample => 
          plotSamples.some(s => s.id === sample.id) 
            ? { ...sample, synced: true }
            : sample
        );
        await saveData('treeSamples', updatedSamples);
        setTreeSamples(updatedSamples);
      }
    }
  };

  const syncSoilSamples = async (samples: SoilSample[]) => {
    for (const sample of samples) {
      const response = await fetch(`${API_URL}/soil-samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId: sample.plotId,
          depth_cm: sample.depth_cm,
          organic_carbon_percent: sample.organic_carbon_percent,
          bulk_density_g_cm3: sample.bulk_density_g_cm3,
          ph_value: sample.ph_value,
        }),
      });

      if (response.ok) {
        const updatedSamples = soilSamples.map(s => 
          s.id === sample.id ? { ...s, synced: true } : s
        );
        await saveData('soilSamples', updatedSamples);
        setSoilSamples(updatedSamples);
      }
    }
  };

  const syncClimateData = async (data: ClimateData[]) => {
    for (const climate of data) {
      const response = await fetch(`${API_URL}/climate-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId: climate.plotId,
          temperature_celsius: climate.temperature_celsius,
          humidity_percent: climate.humidity_percent,
          rainfall_mm: climate.rainfall_mm,
          wind_speed_m_s: climate.wind_speed_m_s,
        }),
      });

      if (response.ok) {
        const updatedData = climateData.map(c => 
          c.id === climate.id ? { ...c, synced: true } : c
        );
        await saveData('climateData', updatedData);
        setClimateData(updatedData);
      }
    }
  };

  const syncManagementPractices = async (practices: ManagementPractice[]) => {
    for (const practice of practices) {
      const response = await fetch(`${API_URL}/management-practices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId: practice.plotId,
          practiceType: practice.practiceType,
          description: practice.description,
        }),
      });

      if (response.ok) {
        const updatedPractices = managementPractices.map(p => 
          p.id === practice.id ? { ...p, synced: true } : p
        );
        await saveData('managementPractices', updatedPractices);
        setManagementPractices(updatedPractices);
      }
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await Promise.all([
              AsyncStorage.removeItem('treeSamples'),
              AsyncStorage.removeItem('soilSamples'),
              AsyncStorage.removeItem('climateData'),
              AsyncStorage.removeItem('managementPractices'),
            ]);
            setTreeSamples([]);
            setSoilSamples([]);
            setClimateData([]);
            setManagementPractices([]);
            Alert.alert('Success', 'All data cleared');
          },
        },
      ]
    );
  };

  const getUnsyncedCount = () => {
    return (
      treeSamples.filter(s => !s.synced).length +
      soilSamples.filter(s => !s.synced).length +
      climateData.filter(d => !d.synced).length +
      managementPractices.filter(p => !p.synced).length
    );
  };

  const renderTabButton = (tab: DataType, label: string, count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
      <View style={styles.tabBadge}>
        <Text style={styles.tabBadgeText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTreeForm = () => (
    <View style={styles.form}>
      <Text style={styles.label}>Plot ID</Text>
      <TextInput
        style={styles.input}
        value={plotId}
        onChangeText={setPlotId}
        placeholder="Enter Plot ID"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Species</Text>
      <TextInput
        style={styles.input}
        value={species}
        onChangeText={setSpecies}
        placeholder="e.g., Teak, Mango"
        autoCapitalize="words"
      />

      <Text style={styles.label}>DBH (cm)</Text>
      <TextInput
        style={styles.input}
        value={dbh}
        onChangeText={setDbh}
        placeholder="e.g., 15.5"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.addButton} onPress={addTreeSample}>
        <Text style={styles.buttonText}>Add Tree Sample</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSoilForm = () => (
    <View style={styles.form}>
      <Text style={styles.label}>Plot ID</Text>
      <TextInput
        style={styles.input}
        value={soilPlotId}
        onChangeText={setSoilPlotId}
        placeholder="Enter Plot ID"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Depth (cm)</Text>
      <TextInput
        style={styles.input}
        value={depth}
        onChangeText={setDepth}
        placeholder="e.g., 30"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Organic Carbon (%)</Text>
      <TextInput
        style={styles.input}
        value={organicCarbon}
        onChangeText={setOrganicCarbon}
        placeholder="e.g., 2.5"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Bulk Density (g/cm³)</Text>
      <TextInput
        style={styles.input}
        value={bulkDensity}
        onChangeText={setBulkDensity}
        placeholder="e.g., 1.2"
        keyboardType="numeric"
      />

      <Text style={styles.label}>pH Value</Text>
      <TextInput
        style={styles.input}
        value={phValue}
        onChangeText={setPhValue}
        placeholder="e.g., 6.5"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.addButton} onPress={addSoilSample}>
        <Text style={styles.buttonText}>Add Soil Sample</Text>
      </TouchableOpacity>
    </View>
  );

  const renderClimateForm = () => (
    <View style={styles.form}>
      <Text style={styles.label}>Plot ID</Text>
      <TextInput
        style={styles.input}
        value={climatePlotId}
        onChangeText={setClimatePlotId}
        placeholder="Enter Plot ID"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Temperature (°C)</Text>
      <TextInput
        style={styles.input}
        value={temperature}
        onChangeText={setTemperature}
        placeholder="e.g., 25.5"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Humidity (%)</Text>
      <TextInput
        style={styles.input}
        value={humidity}
        onChangeText={setHumidity}
        placeholder="e.g., 65"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Rainfall (mm)</Text>
      <TextInput
        style={styles.input}
        value={rainfall}
        onChangeText={setRainfall}
        placeholder="e.g., 15.2"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Wind Speed (m/s)</Text>
      <TextInput
        style={styles.input}
        value={windSpeed}
        onChangeText={setWindSpeed}
        placeholder="e.g., 3.5"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.addButton} onPress={addClimateData}>
        <Text style={styles.buttonText}>Add Climate Data</Text>
      </TouchableOpacity>
    </View>
  );

  const renderManagementForm = () => (
    <View style={styles.form}>
      <Text style={styles.label}>Plot ID</Text>
      <TextInput
        style={styles.input}
        value={managementPlotId}
        onChangeText={setManagementPlotId}
        placeholder="Enter Plot ID"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Practice Type</Text>
      <View style={styles.pickerContainer}>
        {(['irrigation', 'fertilization', 'pruning', 'pest_control', 'harvesting'] as const).map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.practiceTypeButton, practiceType === type && styles.selectedPracticeType]}
            onPress={() => setPracticeType(type)}
          >
            <Text style={[styles.practiceTypeText, practiceType === type && styles.selectedPracticeTypeText]}>
              {type.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={practiceDescription}
        onChangeText={setPracticeDescription}
        placeholder="Describe the management practice..."
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity style={styles.addButton} onPress={addManagementPractice}>
        <Text style={styles.buttonText}>Add Management Practice</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDataList = () => {
    switch (activeTab) {
      case 'trees':
        return (
          <View style={styles.samplesSection}>
            <Text style={styles.sectionTitle}>Tree Samples ({treeSamples.length})</Text>
            {treeSamples.length === 0 ? (
              <Text style={styles.emptyText}>No tree samples yet</Text>
            ) : (
              treeSamples.map((sample, index) => (
                <View key={sample.id} style={styles.sampleItem}>
                  <View style={styles.sampleHeader}>
                    <Text style={styles.sampleNumber}>#{index + 1}</Text>
                    <View style={[styles.syncStatus, sample.synced && styles.synced]}>
                      <Text style={styles.syncStatusText}>
                        {sample.synced ? '✓ Synced' : '⏳ Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sampleText}>Plot: {sample.plotId}</Text>
                  <Text style={styles.sampleText}>Species: {sample.species}</Text>
                  <Text style={styles.sampleText}>DBH: {sample.dbh_cm} cm</Text>
                  <Text style={styles.sampleDate}>
                    {new Date(sample.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      case 'soil':
        return (
          <View style={styles.samplesSection}>
            <Text style={styles.sectionTitle}>Soil Samples ({soilSamples.length})</Text>
            {soilSamples.length === 0 ? (
              <Text style={styles.emptyText}>No soil samples yet</Text>
            ) : (
              soilSamples.map((sample, index) => (
                <View key={sample.id} style={styles.sampleItem}>
                  <View style={styles.sampleHeader}>
                    <Text style={styles.sampleNumber}>#{index + 1}</Text>
                    <View style={[styles.syncStatus, sample.synced && styles.synced]}>
                      <Text style={styles.syncStatusText}>
                        {sample.synced ? '✓ Synced' : '⏳ Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sampleText}>Plot: {sample.plotId}</Text>
                  <Text style={styles.sampleText}>Depth: {sample.depth_cm} cm</Text>
                  <Text style={styles.sampleText}>Organic Carbon: {sample.organic_carbon_percent}%</Text>
                  <Text style={styles.sampleText}>Bulk Density: {sample.bulk_density_g_cm3} g/cm³</Text>
                  <Text style={styles.sampleText}>pH: {sample.ph_value}</Text>
                  <Text style={styles.sampleDate}>
                    {new Date(sample.sampleDate).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      case 'climate':
        return (
          <View style={styles.samplesSection}>
            <Text style={styles.sectionTitle}>Climate Data ({climateData.length})</Text>
            {climateData.length === 0 ? (
              <Text style={styles.emptyText}>No climate data yet</Text>
            ) : (
              climateData.map((data, index) => (
                <View key={data.id} style={styles.sampleItem}>
                  <View style={styles.sampleHeader}>
                    <Text style={styles.sampleNumber}>#{index + 1}</Text>
                    <View style={[styles.syncStatus, data.synced && styles.synced]}>
                      <Text style={styles.syncStatusText}>
                        {data.synced ? '✓ Synced' : '⏳ Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sampleText}>Plot: {data.plotId}</Text>
                  <Text style={styles.sampleText}>Temperature: {data.temperature_celsius}°C</Text>
                  <Text style={styles.sampleText}>Humidity: {data.humidity_percent}%</Text>
                  <Text style={styles.sampleText}>Rainfall: {data.rainfall_mm} mm</Text>
                  <Text style={styles.sampleText}>Wind Speed: {data.wind_speed_m_s} m/s</Text>
                  <Text style={styles.sampleDate}>
                    {new Date(data.measurementDate).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      case 'management':
        return (
          <View style={styles.samplesSection}>
            <Text style={styles.sectionTitle}>Management Practices ({managementPractices.length})</Text>
            {managementPractices.length === 0 ? (
              <Text style={styles.emptyText}>No management practices yet</Text>
            ) : (
              managementPractices.map((practice, index) => (
                <View key={practice.id} style={styles.sampleItem}>
                  <View style={styles.sampleHeader}>
                    <Text style={styles.sampleNumber}>#{index + 1}</Text>
                    <View style={[styles.syncStatus, practice.synced && styles.synced]}>
                      <Text style={styles.syncStatusText}>
                        {practice.synced ? '✓ Synced' : '⏳ Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sampleText}>Plot: {practice.plotId}</Text>
                  <Text style={styles.sampleText}>Type: {practice.practiceType.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.sampleText}>Description: {practice.description}</Text>
                  <Text style={styles.sampleDate}>
                    {new Date(practice.date).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        );
    }
  };

  const unsyncedCount = getUnsyncedCount();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>MRV-in-a-Box</Text>
          <Text style={styles.subtitle}>VM0042 Data Collection</Text>
        </View>

        <View style={styles.tabContainer}>
          {renderTabButton('trees', 'Trees', treeSamples.length)}
          {renderTabButton('soil', 'Soil', soilSamples.length)}
          {renderTabButton('climate', 'Climate', climateData.length)}
          {renderTabButton('management', 'Management', managementPractices.length)}
        </View>

        {activeTab === 'trees' && renderTreeForm()}
        {activeTab === 'soil' && renderSoilForm()}
        {activeTab === 'climate' && renderClimateForm()}
        {activeTab === 'management' && renderManagementForm()}

        <View style={styles.syncSection}>
          <View style={styles.syncInfo}>
            <Text style={styles.syncText}>
              {unsyncedCount} items pending sync
            </Text>
            {syncing && <ActivityIndicator size="small" color="#007AFF" />}
          </View>
          
          <TouchableOpacity 
            style={[styles.syncButton, unsyncedCount === 0 && styles.syncButtonDisabled]} 
            onPress={syncToServer}
            disabled={unsyncedCount === 0 || syncing}
          >
            <Text style={styles.buttonText}>
              {syncing ? 'Syncing...' : 'Sync to Server'}
            </Text>
          </TouchableOpacity>
        </View>

        {renderDataList()}

        <View style={styles.clearSection}>
          <TouchableOpacity onPress={clearAllData}>
            <Text style={styles.clearButton}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#2c5aa0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#2c5aa0',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  practiceTypeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedPracticeType: {
    backgroundColor: '#2c5aa0',
    borderColor: '#2c5aa0',
  },
  practiceTypeText: {
    fontSize: 12,
    color: '#666',
  },
  selectedPracticeTypeText: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  syncSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncText: {
    fontSize: 14,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  samplesSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  sampleItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sampleNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  syncStatus: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  synced: {
    backgroundColor: '#28a745',
  },
  syncStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  sampleText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  sampleDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  clearSection: {
    padding: 20,
    alignItems: 'center',
  },
  clearButton: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },
});
