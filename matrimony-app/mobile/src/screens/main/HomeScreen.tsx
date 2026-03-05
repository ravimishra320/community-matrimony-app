import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import CardStack from '../../components/CardStack';

export default function HomeScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.recommendations.get(20),
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-light">
      <CardStack 
        profiles={data?.data.recommendations || []} 
        onRefresh={refetch}
      />
    </View>
  );
}
