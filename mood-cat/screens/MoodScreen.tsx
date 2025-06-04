import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ScrollView,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';

// Types for our data
interface BreedRecommendation {
  id: string;
  name: string;
  description: string;
  temperament: string;
  origin: string;
  explanation: string;
  images: Array<{
    id: string;
    url: string;
  }>;
}

// Available moods based on the API
const availableMoods = [
  { key: 'mutlu', label: 'Happy', emoji: '😀' },
  { key: 'üzgün', label: 'Sad', emoji: '😔' },
  { key: 'enerjik', label: 'Energetic', emoji: '⚡' },
  { key: 'sakin', label: 'Calm', emoji: '😌' },
  { key: 'yalnız', label: 'Lonely', emoji: '🥺' },
  { key: 'stresli', label: 'Stressed', emoji: '😫' },
  { key: 'heyecanlı', label: 'Excited', emoji: '🤩' },
  { key: 'yorgun', label: 'Tired', emoji: '😴' }
];

export default function MoodScreen() {
  const [customMood, setCustomMood] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<BreedRecommendation | null>(null);
  const navigation = useNavigation();

  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood);
    setCustomMood('');
  };

  const getRecommendation = async () => {
    if (!selectedMood && !customMood) {
      toast.error('Please select or enter a mood');
      return;
    }

    const moodToSend = selectedMood || customMood;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/cats/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: moodToSend }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      toast.error('Sorry, we couldn\'t find a match for your mood');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood Match</Text>
        <View style={styles.placeholder}></View>
      </View>

      {!recommendation ? (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>How are you feeling today?</Text>
          <Text style={styles.subtitle}>We'll match you with the perfect cat breed based on your mood</Text>
          
          <View style={styles.moodGrid}>
            {availableMoods.map((mood) => (
              <TouchableOpacity 
                key={mood.key} 
                style={[
                  styles.moodButton,
                  selectedMood === mood.key && styles.selectedMoodButton
                ]} 
                onPress={() => handleMoodSelection(mood.key)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodText,
                  selectedMood === mood.key && styles.selectedMoodText
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.orText}>or</Text>

          <View style={styles.customMoodContainer}>
            <TextInput
              style={styles.customMoodInput}
              placeholder="Describe your mood..."
              value={customMood}
              onChangeText={(text) => {
                setCustomMood(text);
                setSelectedMood(null);
              }}
            />
          </View>

          <TouchableOpacity 
            style={styles.findMatchButton} 
            onPress={getRecommendation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.findMatchButtonText}>Find My Cat Match</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.recommendationContainer}>
          <View style={styles.breedCard}>
            <Text style={styles.breedName}>{recommendation.name}</Text>
            <Text style={styles.breedTemperament}>Temperament: {recommendation.temperament}</Text>
            <Text style={styles.breedOrigin}>Origin: {recommendation.origin}</Text>
            
            <View style={styles.imageRow}>
              {recommendation.images.slice(0, 3).map((image) => (
                <Image 
                  key={image.id} 
                  source={{ uri: image.url }} 
                  style={styles.recommendationImage} 
                />
              ))}
            </View>
            
            <Text style={styles.explanationLabel}>Why we matched you with {recommendation.name}:</Text>
            <Text style={styles.explanationText}>{recommendation.explanation}</Text>
            
            <Text style={styles.breedDescription}>{recommendation.description}</Text>
            
            <TouchableOpacity 
              style={styles.anotherMatchButton} 
              onPress={() => setRecommendation(null)}
            >
              <Text style={styles.anotherMatchButtonText}>Try Another Mood</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#eee',
  },
  selectedMoodButton: {
    borderColor: '#FF5A5F',
    backgroundColor: '#FFF5F5',
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedMoodText: {
    color: '#FF5A5F',
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginVertical: 16,
  },
  customMoodContainer: {
    marginBottom: 30,
  },
  customMoodInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#eee',
  },
  findMatchButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  findMatchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendationContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  breedCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  breedName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  breedTemperament: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  breedOrigin: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recommendationImage: {
    width: '32%',
    height: 100,
    borderRadius: 8,
  },
  explanationLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FF5A5F',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  breedDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  anotherMatchButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  anotherMatchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});