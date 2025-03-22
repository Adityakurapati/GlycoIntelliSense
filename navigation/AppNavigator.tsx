import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// Main Navigation
import Navigation from './index';  // Import the main navigation
// Context
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

// Auth Navigator
const AuthNavigator = () => {
        return (
                <Stack.Navigator
                        screenOptions={{
                                headerShown: false,
                                cardStyle: { backgroundColor: '#f8f9fa' }
                        }}
                >
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                </Stack.Navigator>
        );
};

// Root Navigator
export default function AppNavigator() {
        const { user, loading } = useAuth();

        if (loading) {
                // Loading screen
                return (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#2089dc" />
                        </View>
                );
        }

        // Return auth screens or main app navigation based on authentication state
        return user ? <Navigation /> : <AuthNavigator />;
}