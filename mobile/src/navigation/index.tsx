import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import LogMoodScreen from '../screens/mood/LogMoodScreen';
import ProfessionalsScreen from '../screens/professionals/ProfessionalsScreen';
import ConversationsScreen from '../screens/messages/ConversationsScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import RemindersScreen from '../screens/settings/RemindersScreen';

export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type TabParams = {
  Home: undefined;
  Professionals: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type LogMoodStackParams = {
  HomeTabs: undefined;
  LogMood: undefined;
  Reminders: undefined;
};

export type MessagesStackParams = {
  ConversationList: undefined;
  Chat: { conversationId: string; professionalName: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const Tab = createBottomTabNavigator<TabParams>();
const RootStack = createNativeStackNavigator<LogMoodStackParams>();
const MessagesStack = createNativeStackNavigator<MessagesStackParams>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>;
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen
        name="ConversationList"
        component={ConversationsScreen}
        options={{ headerShown: false }}
      />
      <MessagesStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.professionalName,
          headerBackTitle: 'Back',
          headerTintColor: '#5B2D8E',
          headerStyle: { backgroundColor: '#F7F3FF' },
          headerShadowVisible: false,
        })}
      />
    </MessagesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#F0E8FF', paddingBottom: 4 },
        tabBarActiveTintColor: '#5B2D8E',
        tabBarInactiveTintColor: '#bbb',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Professionals"
        component={ProfessionalsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🧠" focused={focused} />,
          tabBarLabel: 'Find support',
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />,
          tabBarLabel: 'Messages',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="HomeTabs" component={MainTabs} />
      <RootStack.Screen
        name="LogMood"
        component={LogMoodScreen}
        options={{
          headerShown: true,
          title: 'Log mood',
          headerBackTitle: 'Back',
          headerTintColor: '#5B2D8E',
          headerStyle: { backgroundColor: '#F7F3FF' },
          headerShadowVisible: false,
        }}
      />
      <RootStack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          headerShown: true,
          title: 'Reminders',
          headerBackTitle: 'Back',
          headerTintColor: '#5B2D8E',
          headerStyle: { backgroundColor: '#F7F3FF' },
          headerShadowVisible: false,
        }}
      />
    </RootStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#5B2D8E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F3FF' },
});
