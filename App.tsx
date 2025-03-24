import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { ThemeProvider } from "@rneui/themed"
import AppNavigator from "./navigation/AppNavigator"  // Updated import path
import { theme } from "./constants/theme"
import { AuthProvider } from "./context/AuthContext"  // Make sure to import AuthProvider

export default function App() {

        return (
                <SafeAreaProvider>
                        <ThemeProvider theme={theme}>
                                <AuthProvider>
                                        <NavigationContainer>
                                                <AppNavigator />
                                                <StatusBar style="auto" />
                                        </NavigationContainer>
                                </AuthProvider>
                        </ThemeProvider>
                </SafeAreaProvider>
        )
}