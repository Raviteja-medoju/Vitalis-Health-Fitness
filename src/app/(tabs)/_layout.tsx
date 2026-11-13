import { Tabs } from 'expo-router';
import {
  Activity,
  Dumbbell,
  Home,
  MessageCircleHeart,
  Salad,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, useMotionPreference, useTheme } from '@/design-system';

export default function TabsLayout() {
  const { colors, typography } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sidebar = width >= 1000 && fontScale < 1.5;
  const compactWebTabs = Platform.OS === 'web' && !sidebar;
  const reduceMotion = useMotionPreference();
  const tabLabelLineHeight = 16;
  const iconWrapperHeight = compactWebTabs ? 24 : 28;
  const topPadding = compactWebTabs ? 4 : 6;
  const bottomPadding = Math.max(compactWebTabs ? 6 : 8, insets.bottom);
  // Keep the label and router's 10px item padding inside the touch target.
  // The smaller browser icon saves space without squeezing the label again.
  const bottomContentHeight =
    iconWrapperHeight +
    Math.ceil(tabLabelLineHeight * Math.max(1, fontScale)) +
    10 +
    topPadding +
    2;
  const renderTabIcon = (
    Icon: LucideIcon,
    color: React.ComponentProps<LucideIcon>['color'],
    size: number,
    focused: boolean,
  ) =>
    compactWebTabs ? (
      <View
        style={{
          width: 32,
          height: iconWrapperHeight,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? colors.bg.brandSubtle : 'transparent',
        }}
      >
        <Icon color={color} size={20} />
      </View>
    ) : (
      <Icon color={color} size={size} />
    );
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
          tabBarActiveBackgroundColor: compactWebTabs ? 'transparent' : colors.bg.brandSubtle,
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
              : {
                  height: bottomContentHeight + bottomPadding,
                  paddingBottom: bottomPadding,
                  paddingTop: topPadding,
                }),
          },
          tabBarItemStyle: {
            borderRadius: 14,
            marginHorizontal: sidebar ? 4 : 0,
            ...(sidebar ? { marginBottom: 8, minHeight: 52 } : { paddingVertical: 0 }),
          },
          tabBarLabelStyle: {
            fontSize: width < 360 ? 11 : typography.caption.fontSize,
            fontWeight: '600',
            ...(!sidebar ? { lineHeight: tabLabelLineHeight, flexShrink: 0 } : null),
            ...(Platform.OS === 'web' ? { fontFamily: 'system-ui' } : null),
          },
          tabBarIconStyle: !sidebar
            ? {
                flexShrink: 0,
                ...(compactWebTabs ? { width: 32, height: iconWrapperHeight } : null),
              }
            : undefined,
          sceneStyle: { backgroundColor: colors.bg.canvas },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarAccessibilityLabel: 'Today, tab',
            tabBarIcon: ({ color, size, focused }) => renderTabIcon(Home, color, size, focused),
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: 'Workouts',
            tabBarAccessibilityLabel: 'Workouts, tab',
            tabBarIcon: ({ color, size, focused }) => renderTabIcon(Dumbbell, color, size, focused),
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            title: 'Coach',
            tabBarAccessibilityLabel: 'Coach, tab',
            tabBarIcon: ({ color, size, focused }) =>
              renderTabIcon(MessageCircleHeart, color, size, focused),
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarAccessibilityLabel: 'Nutrition, tab',
            tabBarIcon: ({ color, size, focused }) => renderTabIcon(Salad, color, size, focused),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'You',
            tabBarAccessibilityLabel: 'Profile and settings, tab',
            tabBarIcon: ({ color, size, focused }) =>
              renderTabIcon(UserRound, color, size, focused),
          }}
        />
      </Tabs>
    </View>
  );
}
