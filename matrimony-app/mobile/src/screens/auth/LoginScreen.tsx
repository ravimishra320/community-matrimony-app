import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { cognitoService } from '../../services/cognito';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleContinue = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      await cognitoService.signUp(formattedPhone);
      navigation.navigate('Otp', { phoneNumber: formattedPhone });
    } catch (error: any) {
      if (error.code === 'UsernameExistsException') {
        navigation.navigate('Otp', { phoneNumber: `+91${phoneNumber}` });
      } else {
        Alert.alert('Error', error.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-dark mb-2">Welcome</Text>
      <Text className="text-gray-dark mb-8">Enter your phone number to continue</Text>
      
      <TextInput
        className="border border-gray-medium rounded-card px-4 py-4 text-lg mb-6"
        placeholder="+91 Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        maxLength={13}
      />

      <TouchableOpacity
        className="bg-primary rounded-card py-4 items-center"
        onPress={handleContinue}
        disabled={loading}
      >
        <Text className="text-dark font-semibold text-lg">
          {loading ? 'Sending...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
