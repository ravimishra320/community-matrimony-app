import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BasicInfoScreen from '../screens/onboarding/BasicInfoScreen';
import CommunityDetailsScreen from '../screens/onboarding/CommunityDetailsScreen';
import PhotoUploadScreen from '../screens/onboarding/PhotoUploadScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="BasicInfo" 
        component={BasicInfoScreen}
        options={{ title: 'Basic Information' }}
      />
      <Stack.Screen 
        name="CommunityDetails" 
        component={CommunityDetailsScreen}
        options={{ title: 'Community Details' }}
      />
      <Stack.Screen 
        name="PhotoUpload" 
        component={PhotoUploadScreen}
        options={{ title: 'Upload Photos' }}
      />
    </Stack.Navigator>
  );
}
