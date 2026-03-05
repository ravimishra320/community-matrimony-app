import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../api/endpoints';
import { useProfileStore } from '../../store/profileStore';
import axios from 'axios';

export default function PhotoUploadScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [idProof, setIdProof] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();
  const { profile } = useProfileStore();

  const pickImage = async (type: 'PHOTO' | 'ID_PROOF') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'PHOTO' ? [3, 4] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri, type);
    }
  };

  const uploadImage = async (uri: string, purpose: 'PHOTO' | 'ID_PROOF') => {
    setUploading(true);
    try {
      // Get pre-signed URL
      const { data } = await api.upload.getPresignedUrl('image/jpeg', purpose);
      
      // Upload to S3
      const response = await fetch(uri);
      const blob = await response.blob();
      await axios.put(data.uploadUrl, blob, {
        headers: { 'Content-Type': 'image/jpeg' },
      });

      if (purpose === 'PHOTO') {
        setPhotos([...photos, data.key]);
      } else {
        setIdProof(data.key);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0 || !idProof) {
      Alert.alert('Error', 'Please upload at least one photo and ID proof');
      return;
    }

    setUploading(true);
    try {
      // Update profile with photos
      await api.profile.updateMe({
        ...profile,
        photos,
      });

      // Submit verification
      await api.verification.submit(idProof);

      Alert.alert('Success', 'Profile submitted for verification!');
      // Navigation will be handled by RootNavigator based on account status
    } catch (error) {
      Alert.alert('Error', 'Failed to submit profile');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-dark mb-2">Upload Photos</Text>
      <Text className="text-gray-dark mb-6">
        Add photos and ID proof for verification
      </Text>

      <TouchableOpacity
        className="border-2 border-dashed border-gray-medium rounded-card h-48 justify-center items-center mb-4"
        onPress={() => pickImage('PHOTO')}
        disabled={uploading}
      >
        <Text className="text-gray-dark">+ Add Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border-2 border-dashed border-gray-medium rounded-card h-32 justify-center items-center mb-6"
        onPress={() => pickImage('ID_PROOF')}
        disabled={uploading}
      >
        <Text className="text-gray-dark">
          {idProof ? '✓ ID Proof Uploaded' : '+ Upload ID Proof'}
        </Text>
      </TouchableOpacity>

      {uploading && <ActivityIndicator size="large" color="#FFD700" />}

      <TouchableOpacity
        className="bg-primary rounded-card py-4 items-center"
        onPress={handleSubmit}
        disabled={uploading || photos.length === 0 || !idProof}
      >
        <Text className="text-dark font-semibold text-lg">Submit for Verification</Text>
      </TouchableOpacity>
    </View>
  );
}
