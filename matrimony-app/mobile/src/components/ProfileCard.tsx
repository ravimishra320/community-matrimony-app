import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RecommendedProfile } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  profile: RecommendedProfile;
}

export default function ProfileCard({ profile }: Props) {
  const age = profile.age || 25;
  const photoUri = profile.photos?.[0] || 'https://via.placeholder.com/400';

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: photoUri }} 
        style={styles.image}
        blurRadius={profile.isBlurred ? 10 : 0}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.display_name}</Text>
            <Text style={styles.age}>, {age}</Text>
          </View>
          
          <View style={styles.gotraBadge}>
            <Text style={styles.gotraText}>
              {profile.community_data?.gotra || 'N/A'}
            </Text>
          </View>
          
          {profile.city && (
            <Text style={styles.location}>📍 {profile.city}</Text>
          )}
          
          {profile.occupation && (
            <Text style={styles.occupation}>💼 {profile.occupation}</Text>
          )}
          
          {profile.education && (
            <Text style={styles.education}>🎓 {profile.education}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  infoContainer: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  age: {
    fontSize: 28,
    color: '#fff',
  },
  gotraBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  gotraText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  location: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  occupation: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  education: {
    fontSize: 16,
    color: '#fff',
  },
});
