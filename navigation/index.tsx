"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Icon } from "@rneui/themed"
import { ScrollView } from "react-native"
import { ListItem } from "@rneui/themed"
import { useTheme } from "@rneui/themed"

import HomeScreen from "../screens/home-screen"
import BloodSugarScreen from "../screens/blood-sugar-screen"
import GoalsScreen from "../screens/goals-screen"
import AppointmentsScreen from "../screens/appointments-screen"
import HealthRiskScreen from "../screens/health-risk-screen"
import StepCounterScreen from "../screens/step-counter-screen"
import MedicationScreen from "../screens/medication-screen"
import ProgressScreen from "../screens/progress-screen"
import SettingsScreen from "../screens/settings-screen"
import NutritionScreen from "../screens/nutrition-screen"

// Define the types for our navigation
export type RootStackParamList = {
        Main: undefined
        Settings: undefined
}

export type MainTabParamList = {
        Home: undefined
        BloodSugar: undefined
        Goals: undefined
        Appointments: undefined
        More: undefined
}

export type MoreStackParamList = {
        MoreMenu: undefined
        HealthRisk: undefined
        StepCounter: undefined
        Medication: undefined
        Progress: undefined
        Nutrition: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()
const MoreStack = createNativeStackNavigator<MoreStackParamList>()

// More menu stack navigator
function MoreNavigator() {
        return (
                <MoreStack.Navigator>
                        <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: "More Options" }} />
                        <MoreStack.Screen name="HealthRisk" component={HealthRiskScreen} options={{ title: "Health Risk Assessment" }} />
                        <MoreStack.Screen name="StepCounter" component={StepsCounter} options={{ title: "Step Counter" }} />
                        <MoreStack.Screen name="Medication" component={MedicationScreen} options={{ title: "Medications & Reminders" }} />
                        <MoreStack.Screen name="Progress" component={ProgressScreen} options={{ title: "Progress Monitoring" }} />
                        <MoreStack.Screen name="Nutrition" component={NutritionScreen} options={{ title: "AI Nutrition Advisor" }} />
                </MoreStack.Navigator>
        )
}

// More menu screen
function MoreMenuScreen({ navigation }: any) {
        const menuItems = [
                { title: "Health Risk Assessment", icon: "alert-circle", screen: "HealthRisk" },
                { title: "Step Counter", icon: "walk", screen: "StepCounter" },
                { title: "Medications & Reminders", icon: "pill", screen: "Medication" },
                { title: "Progress Monitoring", icon: "trending-up", screen: "Progress" },
                { title: "AI Nutrition Advisor", icon: "food", screen: "Nutrition" },
                { title: "Settings", icon: "settings", screen: "Settings", root: true },
        ]

        return (
                <ScrollView style={{ flex: 1, padding: 15 }}>
                        {menuItems.map((item, index) => (
                                <ListItem
                                        key={index}
                                        bottomDivider
                                        onPress={() => {
                                                if (item.root) {
                                                        navigation.navigate("Settings")
                                                } else {
                                                        navigation.navigate(item.screen)
                                                }
                                        }}
                                >
                                        <Icon name={item.icon} type="material-community" />
                                        <ListItem.Content>
                                                <ListItem.Title>{item.title}</ListItem.Title>
                                        </ListItem.Content>
                                        <ListItem.Chevron />
                                </ListItem>
                        ))}
                </ScrollView>
        )
}

// Main tab navigator
function TabNavigator() {
        const { theme } = useTheme()

        return (
                <Tab.Navigator
                        screenOptions={({ route }) => ({
                                tabBarIcon: ({ focused, color, size }) => {
                                        let iconName

                                        if (route.name === "Home") {
                                                iconName = "home"
                                        } else if (route.name === "BloodSugar") {
                                                iconName = "droplet"
                                        } else if (route.name === "Goals") {
                                                iconName = "target"
                                        } else if (route.name === "Appointments") {
                                                iconName = "calendar"
                                        } else if (route.name === "More") {
                                                iconName = "menu"
                                        }

                                        return <Icon name={iconName} type="feather" size={size} color={color} />
                                },
                                tabBarActiveTintColor: theme.colors.primary,
                                tabBarInactiveTintColor: "gray",
                        })}
                >
                        <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Dashboard" }} />
                        <Tab.Screen name="BloodSugar" component={BloodSugarScreen} options={{ title: "Blood Sugar" }} />
                        <Tab.Screen name="Goals" component={GoalsScreen} options={{ title: "Goals" }} />
                        <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: "Appointments" }} />
                        <Tab.Screen name="More" component={MoreNavigator} options={{ headerShown: false }} />
                </Tab.Navigator>
        )
}

// Root navigator
export default function Navigation() {
        return (
                <Stack.Navigator>
                        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
                </Stack.Navigator>
        )
}

