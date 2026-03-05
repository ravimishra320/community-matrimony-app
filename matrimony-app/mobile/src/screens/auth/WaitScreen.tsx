import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function WaitScreen() {
  return (
    <View className="flex-1 bg-white px-6 justify-center items-center">
      <ActivityIndicator size="large" color="#FFD700" />
      <Text className="text-2xl font-bold text-dark mt-6 mb-2">
        Verification in Progress
      </Text>
      <Text className="text-gray-dark text-center">
        Your profile is being reviewed by our team.{'\n'}
        This usually takes 24-48 hours.
      </Text>
    </View>
  );
}
