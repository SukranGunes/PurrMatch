import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

// Types for our data
interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

interface Breed {
  id: string;
  name: string;
  description: string;
  temperament: string;
  origin: string;
}

type TabType = 'discover' | 'breeds' | 'mood';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [cats, setCats] = useState<CatImage[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchRandomCats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/cats?limit=10');
      const data = await response.json();
      setCats(data);
    } catch (error) {
      console.error('Error fetching cats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreeds = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/breeds');
      const data = await response.json();
      setBreeds(data);
    } catch (error) {
      console.error('Error fetching breeds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchRandomCats();
    } else if (activeTab === 'breeds') {
      fetchBreeds();
    }
  }, [activeTab]);

  const navigateToBreedDetail = (breedId: string, breedName: string) => {
    // @ts-ignore - Typescript might complain about navigate types
    navigation.navigate('BreedDetail', { breedId, breedName });
  };

  const navigateToMood = () => {
    // @ts-ignore - Typescript might complain about navigate types
    navigation.navigate('MoodScreen');
  };

  const renderCatItem = ({ item }: { item: CatImage }) => (
    <View style={styles.catCard}>
      <Image source={{ uri: item.url }} style={styles.catImage} resizeMode="cover" />
    </View>
  );

  const renderBreedItem = ({ item }: { item: Breed }) => (
    <TouchableOpacity 
      style={styles.breedCard} 
      onPress={() => navigateToBreedDetail(item.id, item.name)}
    >
      <Text style={styles.breedName}>{item.name}</Text>
      <Text style={styles.breedOrigin}>Origin: {item.origin}</Text>
      <Text numberOfLines={2} style={styles.breedDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Purrfect Cat App</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]} 
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Discover</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'breeds' && styles.activeTab]} 
          onPress={() => setActiveTab('breeds')}
        >
          <Text style={[styles.tabText, activeTab === 'breeds' && styles.activeTabText]}>Breeds</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'mood' && styles.activeTab]} 
          onPress={() => navigateToMood()}
        >
          <Text style={[styles.tabText, activeTab === 'mood' && styles.activeTabText]}>Mood Match</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading cats...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'discover' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Random Cat Gallery</Text>
                <TouchableOpacity onPress={fetchRandomCats} style={styles.refreshButton}>
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={cats}
                renderItem={renderCatItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
              />
            </>
          )}

          {activeTab === 'breeds' && (
            <>
              <Text style={styles.sectionTitle}>Cat Breeds</Text>
              <FlatList
                data={breeds}
                renderItem={renderBreedItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
              />
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF5A5F',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#FF5A5F',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  listContainer: {
    padding: 8,
  },
  catCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  catImage: {
    width: '100%',
    height: 150,
  },
  breedCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  breedName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  breedOrigin: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  breedDescription: {
    fontSize: 14,
    color: '#777',
  },
  refreshButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  }
});