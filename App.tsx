import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { ThemeProvider } from "@rneui/themed"
import * as Notifications from "expo-notifications"
import AppNavigator from "./navigation/AppNavigator"  // Updated import path
import { theme } from "./constants/theme"
import { AuthProvider } from "./context/AuthContext"  // Make sure to import AuthProvider

// Configure notification handler
Notifications.setNotificationHandler({
        handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
        }),
})

export default function App() {
        useEffect(() => {
                // Request notification permissions
                (async () => {
                        const { status } = await Notifications.requestPermissionsAsync()
                        if (status !== "granted") {
                                console.log("Notification permissions not granted")
                        }
                })()
        }, [])

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