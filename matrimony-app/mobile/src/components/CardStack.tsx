import React, { useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import ProfileCard from './ProfileCard';
import SwipeButtons from './SwipeButtons';
import { RecommendedProfile } from '../types';
import { api } from '../api/endpoints';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface Props {
  profiles: RecommendedProfile[];
  onRefresh: () => void;
}

export default function CardStack({ profiles, onRefresh }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentProfile) return;

    const action = direction === 'right' ? 'CONNECT' : 'PASS';
    
    try {
      await api.recommendations.swipe(currentProfile.user_id, action);
      
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withSpring(event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH);
        runOnJS(handleSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 20}deg` },
    ],
  }));

  if (!currentProfile) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <ProfileCard profile={currentProfile} />
        </Animated.View>
      </GestureDetector>
      
      <SwipeButtons
        onPass={() => handleSwipe('left')}
        onConnect={() => handleSwipe('right')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: '80%',
    position: 'absolute',
  },
});
