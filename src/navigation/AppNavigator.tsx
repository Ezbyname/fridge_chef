// ─────────────────────────────────────────────
// NAVIGATION
// Bottom tabs: Create | Recipe | Favorites
// Stack: wraps each tab for push navigation
// ─────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors, Typography } from '../theme';

// Screens (imported below in App.tsx to avoid circular deps)
import CreateScreen   from '../screens/CreateScreen';
import RecipeScreen   from '../screens/RecipeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Tab bar icon ──────────────────────────────────────────────

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

// ── Root Navigator ────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Create"
          component={CreateScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="🍳" label="Create" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Recipe"
          component={RecipeScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Recipe" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" label="Saved" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  Colors.bg1,
    borderTopColor:   Colors.borderSubtle,
    borderTopWidth:   1,
    height:           72,
    paddingBottom:    12,
    paddingTop:       8,
  },
  tabIcon: {
    alignItems: 'center',
    gap:        4,
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.gold,
  },
});
