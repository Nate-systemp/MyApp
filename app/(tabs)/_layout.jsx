import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../../constants/Yin';

/**
 * Tab layout — single "Home" tab with custom styled tab bar.
 * The tab bar is hidden because the app uses a single main screen
 * with a FAB for upload and navigation for details.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
    </Tabs>
  );
}
