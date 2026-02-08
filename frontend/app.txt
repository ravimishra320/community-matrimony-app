import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from 'react-native';
import HomeFeedScreen from './src/screens/HomeFeedScreen';

// --- THEME CONSTANTS  ---
export const THEME = {
  primary: '#FFD700', // Saffron/Gold
  background: '#FFFFFF',
  text: '#1A1A1A',
  cardBg: '#F5F5F5',
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Connect</Text>
      </View>

      {/* Main Content */}
      <HomeFeedScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.primary,
  },
});
