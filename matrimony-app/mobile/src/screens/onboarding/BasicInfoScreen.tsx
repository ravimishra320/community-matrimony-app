import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { useProfileStore } from '../../store/profileStore';

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  city: z.string().min(2, 'City is required'),
  heightCm: z.string().regex(/^\d+$/, 'Height must be a number'),
  education: z.string().min(2, 'Education is required'),
  occupation: z.string().min(2, 'Occupation is required'),
});

type FormData = z.infer<typeof schema>;

export default function BasicInfoScreen() {
  const navigation = useNavigation();
  const { updateProfile } = useProfileStore();
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    updateProfile({
      displayName: data.displayName,
      gender: data.gender,
      dob: data.dob,
      city: data.city,
      heightCm: parseInt(data.heightCm),
      education: data.education,
      occupation: data.occupation,
    });
    navigation.navigate('CommunityDetails');
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-dark mb-6">Tell us about yourself</Text>
      
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-dark mb-2">Full Name</Text>
            <TextInput
              className="border border-gray-medium rounded-card px-4 py-3"
              value={value}
              onChangeText={onChange}
              placeholder="Enter your name"
            />
            {errors.displayName && (
              <Text className="text-red-500 text-sm mt-1">{errors.displayName.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="dob"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-dark mb-2">Date of Birth</Text>
            <TextInput
              className="border border-gray-medium rounded-card px-4 py-3"
              value={value}
              onChangeText={onChange}
              placeholder="YYYY-MM-DD"
            />
            {errors.dob && (
              <Text className="text-red-500 text-sm mt-1">{errors.dob.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-dark mb-2">City</Text>
            <TextInput
              className="border border-gray-medium rounded-card px-4 py-3"
              value={value}
              onChangeText={onChange}
              placeholder="Your city"
            />
            {errors.city && (
              <Text className="text-red-500 text-sm mt-1">{errors.city.message}</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        className="bg-primary rounded-card py-4 items-center mt-6"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-dark font-semibold text-lg">Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
