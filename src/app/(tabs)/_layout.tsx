import { Tabs } from 'expo-router';
import {
  Activity,
  Dumbbell,
  Home,
  MessageCircleHeart,
  Salad,
  UserRound,
} from 'lucide-react-native';
import React from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';

import { Text, useMotionPreference, useTheme } from '@/design-system';

export default function TabsLayout() {
  const { colors, typography } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const sidebar = width >= 1000 && fontScale < 1.5;
  const reduceMotion = useMotionPreference();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
      {sidebar ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 28,
            paddingVertical: 18,
            backgroundColor: colors.bg.surface,
            borderBottomWidth: 1,
            borderColor: colors.border.default,
          }}
        >
          <Activity size={26} color={colors.fg.brand} />
          <Text variant="headline">vitalis.</Text>
          <Text variant="label" color="secondary" style={{ marginLeft: 18 }}>
            Small wins, every day.
          </Text>
        </View>
      ) : null}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarPosition: sidebar ? 'left' : 'bottom',
          tabBarLabelPosition: sidebar ? 'beside-icon' : 'below-icon',
          tabBarHideOnKeyboard: true,
          animation: reduceMotion ? 'none' : 'fade',
          tabBarActiveBackgroundColor: colors.bg.brandSubtle,
          tabBarActiveTintColor: colors.fg.brand,
          tabBarInactiveTintColor: colors.fg.muted,
          tabBarStyle: {
            backgroundColor: colors.bg.surface,
            borderTopColor: colors.border.default,
            ...(sidebar
              ? {
                  width: 212,
                  minWidth: 212,
                  maxWidth: 212,
                  paddingTop: 24,
                  paddingHorizontal: 12,
                  borderRightColor: colors.border.default,
                }
              : Platform.OS === 'web'
                ? { height: 76, paddingBottom: 10, paddingTop: 10 }
                : { paddingTop: 6 }),
          },
          tabBarItemStyle: {
            borderRadius: 14,
            marginHorizontal: sidebar ? 4 : 0,
            ...(sidebar ? { marginBottom: 8, minHeight: 52 } : { paddingVertical: 0 }),
          },
          tabBarLabelStyle: {
            fontSize: width < 360 ? 11 : typography.caption.fontSize,
            fontWeight: '600',
            ...(Platform.OS === 'web' ? { fontFamily: 'system-ui' } : null),
          },
          sceneStyle: { backgroundColor: colors.bg.canvas },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarAccessibilityLabel: 'Today, tab',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: 'Workouts',
            tabBarAccessibilityLabel: 'Workouts, tab',
            tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            title: 'Coach',
            tabBarAccessibilityLabel: 'Coach, tab',
            tabBarIcon: ({ color, size }) => <MessageCircleHeart color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarAccessibilityLabel: 'Nutrition, tab',
            tabBarIcon: ({ color, size }) => <Salad color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'You',
            tabBarAccessibilityLabel: 'Profile and settings, tab',
            tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
          }}
        />
      </Tabs>
    </View>
  );
}
