import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { useProfileStore } from '../../store/profileStore';

const schema = z.object({
  gotra: z.string().min(2, 'Gotra is required'),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  motherTongue: z.string().min(2, 'Mother tongue is required'),
});

type FormData = z.infer<typeof schema>;

export default function CommunityDetailsScreen() {
  const navigation = useNavigation();
  const { profile, updateProfile } = useProfileStore();
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    updateProfile({
      communityData: {
        gotra: data.gotra,
        caste: data.caste,
        subCaste: data.subCaste,
        motherTongue: data.motherTongue,
      },
    });
    navigation.navigate('PhotoUpload');
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-dark mb-2">Community Details</Text>
      <Text className="text-gray-dark mb-6">
        This helps us find compatible matches
      </Text>
      
      <Controller
        control={control}
        name="gotra"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-dark mb-2">Gotra *</Text>
            <TextInput
              className="border border-gray-medium rounded-card px-4 py-3"
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Bhardwaj, Kashyap"
            />
            {errors.gotra && (
              <Text className="text-red-500 text-sm mt-1">{errors.gotra.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="caste"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-dark mb-2">Caste (Optional)</Text>
            <TextInput
              className="border border-gray-medium rounded-card px-4 py-3"
              value={value}
              onChangeText={onChange}
              placeholder="Your caste"
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="motherTongue"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-dark mb-2">Mother Tongue *</Text>
            <TextInput
              className="border border-gray-medium rounded-card px-4 py-3"
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Hindi, Tamil"
            />
            {errors.motherTongue && (
              <Text className="text-red-500 text-sm mt-1">{errors.motherTongue.message}</Text>
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
