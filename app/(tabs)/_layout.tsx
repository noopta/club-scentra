import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { Platform, Image, StyleSheet } from 'react-native';

const exploreIcon = require('@/assets/images/icons/explore.png');
const meetsIcon = require('@/assets/images/icons/meets.png');
const eventIcon = require('@/assets/images/icons/event.png');
const friendsIcon = require('@/assets/images/icons/friends.png');
const profileIcon = require('@/assets/images/icons/profile.png');

const TAB_BAR_BG = '#181921';

export default function TabLayout() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.tabActive,
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'EXPLORE',
          tabBarIcon: ({ focused }) => (
            <Image
              source={exploreIcon}
              resizeMode="contain"
              tintColor={focused ? Theme.colors.tabActive : '#FFFFFF'}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="meets"
        options={{
          title: 'MEETS',
          tabBarIcon: ({ focused }) => (
            <Image
              source={meetsIcon}
              resizeMode="contain"
              tintColor={focused ? Theme.colors.tabActive : '#FFFFFF'}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="event"
        options={{
          title: 'EVENT',
          tabBarIcon: ({ focused }) => (
            <Image
              source={eventIcon}
              resizeMode="contain"
              tintColor={focused ? Theme.colors.tabActive : '#FFFFFF'}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'FRIENDS',
          tabBarIcon: ({ focused }) => (
            <Image
              source={friendsIcon}
              resizeMode="contain"
              tintColor={focused ? Theme.colors.tabActive : '#FFFFFF'}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ focused }) => (
            <Image
              source={profileIcon}
              resizeMode="contain"
              tintColor={focused ? Theme.colors.tabActive : '#FFFFFF'}
              style={styles.tabIcon}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  tabIcon: {
    width: 26,
    height: 26,
  },
});
