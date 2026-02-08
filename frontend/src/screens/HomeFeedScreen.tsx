import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Mock Data (Since we don't have the backend running yet)
const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Priya',
    age: 26,
    job: 'Software Engineer',
    gotra: 'Bhardwaj',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Anjali',
    age: 24,
    job: 'Doctor',
    gotra: 'Sandilya',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  }
];

export default function HomeFeedScreen() {
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = profiles[currentIndex];

  const handleAction = (action: 'PASS' | 'LIKE') => {
    console.log(`User ${action} on ${currentProfile.name}`);
    // Logic to move to next card
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("No more profiles!");
    }
  };

  if (!currentProfile) return <View style={styles.center}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      
      {/* THE CARD */}
      <View style={styles.cardContainer}>
        <Image source={{ uri: currentProfile.image }} style={styles.image} />
        
        {/* Gradient Overlay for Text Readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{currentProfile.name}, {currentProfile.age}</Text>
            <Text style={styles.subtext}>{currentProfile.job}</Text>
            
            {/* Community Tag */}
            <View style={styles.tag}>
              <Text style={styles.tagText}>Gotra: {currentProfile.gotra}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ACTION BUTTONS (Bumble Style) */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.passButton]} 
          onPress={() => handleAction('PASS')}
        >
          <Text style={styles.passText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.likeButton]} 
          onPress={() => handleAction('LIKE')}
        >
          <Text style={styles.likeText}>♥</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Card Styles
  cardContainer: {
    width: width * 0.9,
    height: height * 0.65,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: { width: '100%', height: '100%' },
  gradient: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  
  // Typography
  infoContainer: { marginBottom: 10 },
  name: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  subtext: { fontSize: 18, color: '#ddd', marginTop: 4 },
  
  // Community Tag
  tag: {
    marginTop: 10,
    backgroundColor: '#FFD700', // Gold
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  tagText: { fontWeight: 'bold', color: '#000', fontSize: 14 },

  // Buttons
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
    marginTop: 30,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  passButton: { backgroundColor: '#FFF' },
  passText: { fontSize: 30, color: '#FF5C5C' }, // Red X
  likeButton: { backgroundColor: '#FFD700' },
  likeText: { fontSize: 30, color: '#FFF' },
});
