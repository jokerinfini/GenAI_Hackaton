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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TreeSample {
  id: string;
  species: string;
  dbh_cm: number;
  plotId: string;
  createdAt: string;
  synced: boolean;
}

const API_URL = 'http://localhost:3001';

export default function App(): JSX.Element {
  const [plotId, setPlotId] = useState('');
  const [species, setSpecies] = useState('');
  const [dbh, setDbh] = useState('');
  const [treeSamples, setTreeSamples] = useState<TreeSample[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadTreeSamples();
  }, []);

  const loadTreeSamples = async () => {
    try {
      const stored = await AsyncStorage.getItem('treeSamples');
      if (stored) {
        setTreeSamples(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading tree samples:', error);
    }
  };

  const saveTreeSamples = async (samples: TreeSample[]) => {
    try {
      await AsyncStorage.setItem('treeSamples', JSON.stringify(samples));
      setTreeSamples(samples);
    } catch (error) {
      console.error('Error saving tree samples:', error);
    }
  };

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
    await saveTreeSamples(updatedSamples);

    // Clear form
    setSpecies('');
    setDbh('');

    Alert.alert('Success', 'Tree sample added successfully!');
  };

  const syncToServer = async () => {
    setSyncing(true);
    try {
      const unsyncedSamples = treeSamples.filter(sample => !sample.synced);
      
      if (unsyncedSamples.length === 0) {
        Alert.alert('Info', 'All samples are already synced');
        return;
      }

      // Group samples by plotId
      const samplesByPlot = unsyncedSamples.reduce((acc, sample) => {
        if (!acc[sample.plotId]) {
          acc[sample.plotId] = [];
        }
        acc[sample.plotId].push(sample);
        return acc;
      }, {} as Record<string, TreeSample[]>);

      // Sync each plot's samples
      for (const [plotId, samples] of Object.entries(samplesByPlot)) {
        try {
          const response = await fetch(`${API_URL}/plots/${plotId}/trees`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plotId,
              trees: samples.map(sample => ({
                species: sample.species,
                dbh_cm: sample.dbh_cm,
              })),
            }),
          });

          if (response.ok) {
            // Mark samples as synced
            const updatedSamples = treeSamples.map(sample => 
              samples.some(s => s.id === sample.id) 
                ? { ...sample, synced: true }
                : sample
            );
            await saveTreeSamples(updatedSamples);
          } else {
            throw new Error(`Failed to sync plot ${plotId}`);
          }
        } catch (error) {
          console.error(`Error syncing plot ${plotId}:`, error);
          Alert.alert('Error', `Failed to sync plot ${plotId}`);
        }
      }

      Alert.alert('Success', 'All samples synced successfully!');
    } catch (error) {
      console.error('Error syncing to server:', error);
      Alert.alert('Error', 'Failed to sync with server');
    } finally {
      setSyncing(false);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all tree samples? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('treeSamples');
            setTreeSamples([]);
            Alert.alert('Success', 'All data cleared');
          },
        },
      ]
    );
  };

  const unsyncedCount = treeSamples.filter(sample => !sample.synced).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>MRV-in-a-Box</Text>
          <Text style={styles.subtitle}>Tree Sample Collection</Text>
        </View>

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

        <View style={styles.syncSection}>
          <View style={styles.syncInfo}>
            <Text style={styles.syncText}>
              {unsyncedCount} samples pending sync
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

        <View style={styles.samplesSection}>
          <View style={styles.samplesHeader}>
            <Text style={styles.sectionTitle}>Tree Samples ({treeSamples.length})</Text>
            {treeSamples.length > 0 && (
              <TouchableOpacity onPress={clearAllData}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

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
  form: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
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
  samplesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
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
});
