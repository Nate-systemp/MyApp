import { Tabs } from 'expo-router';

/**
 * Tab layout — Clean single tab design for the redesigned home screen
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarStyle: { display: 'none' }
        }} 
      />
    </Tabs>
  );
}
