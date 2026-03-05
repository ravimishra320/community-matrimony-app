import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { cognitoService } from '../../services/cognito';
import { useAuthStore } from '../../store/authStore';

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { setUser, setAccessToken } = useAuthStore();
  const { phoneNumber } = route.params as { phoneNumber: string };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await cognitoService.confirmSignUp(phoneNumber, otp);
      const session = await cognitoService.getCurrentSession();
      const accessToken = session.getAccessToken().getJwtToken();
      
      setAccessToken(accessToken);
      // Fetch user data and set user state
      // This will trigger navigation to appropriate screen
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-dark mb-2">Verify OTP</Text>
      <Text className="text-gray-dark mb-8">
        Enter the 6-digit code sent to {phoneNumber}
      </Text>
      
      <TextInput
        className="border border-gray-medium rounded-card px-4 py-4 text-lg text-center mb-6 tracking-widest"
        placeholder="000000"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      <TouchableOpacity
        className="bg-primary rounded-card py-4 items-center mb-4"
        onPress={handleVerify}
        disabled={loading}
      >
        <Text className="text-dark font-semibold text-lg">
          {loading ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="items-center">
        <Text className="text-primary font-medium">Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
