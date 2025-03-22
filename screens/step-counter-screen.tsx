"use client"

import { useState, useEffect, useRef } from "react"
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, ScrollView, Alert } from "react-native"
import { Text, Card, Icon, Button } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import { LineChart } from "react-native-chart-kit"
import { Accelerometer } from "expo-sensors"
import * as Device from 'expo-device'
import * as IntentLauncher from 'expo-intent-launcher'
import * as Linking from 'expo-linking'
import { colors } from "../constants/theme"
import { getDatabase, ref, set, onValue, push, serverTimestamp } from "firebase/database"
import { auth } from "../config/firebase" // Assuming firebase.js exports auth

export default function StepCounterScreen() {
        const [isAccelerometerAvailable, setIsAccelerometerAvailable] = useState<boolean>(false)
        const [currentStepCount, setCurrentStepCount] = useState<number>(0)
        const [isCounting, setIsCounting] = useState<boolean>(false)
        const [lastY, setLastY] = useState<number>(0)
        const [lastTimestamp, setLastTimestamp] = useState<number>(0)
        const [subscription, setSubscription] = useState<any>(null)
        const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly">("daily")
        const [userId, setUserId] = useState<string | null>(null)
        const [permissionStatus, setPermissionStatus] = useState<string | null>(null)

        // Step history from Firebase
        const [stepHistory, setStepHistory] = useState([
                { date: "2023-04-01", steps: 8432 },
                { date: "2023-04-02", steps: 10253 },
                { date: "2023-04-03", steps: 7845 },
                { date: "2023-04-04", steps: 9321 },
                { date: "2023-04-05", steps: 11024 },
                { date: "2023-04-06", steps: 8752 },
                { date: "2023-04-07", steps: 9876 },
        ])

        const dailyGoal = 10000

        useEffect(() => {
                // Get current user
                const unsubscribeAuth = auth.onAuthStateChanged((user) => {
                        if (user) {
                                setUserId(user.uid)
                                // Load user's step history from Firebase
                                loadStepHistory(user.uid)
                        }
                })

                // Check and request permissions
                checkAndRequestPermissions()

                return () => {
                        unsubscribe()
                        unsubscribeAuth()
                }
        }, [])

        // Function to open device settings
        const openSettings = async () => {
                if (Platform.OS === 'ios') {
                        Linking.openURL('app-settings:')
                } else {
                        IntentLauncher.startActivityAsync(
                                IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
                                { data: 'package:' + Device.modelName }
                        )
                }
        }

        // Function to check and request accelerometer permissions
        const checkAndRequestPermissions = async () => {
                try {
                        // Check if accelerometer is available
                        const available = await Accelerometer.isAvailableAsync()
                        setIsAccelerometerAvailable(available)
                        setPermissionStatus(available ? 'granted' : 'denied')

                        if (available) {
                                // Start subscription to accelerometer
                                subscribe()
                        } else {
                                // Accelerometer is not available, show permission alert
                                Alert.alert(
                                        "Permission Required",
                                        "This app needs access to your motion data to track steps. Please enable this in your device settings.",
                                        [
                                                { text: "Cancel", style: "cancel" },
                                                { text: "Settings", onPress: openSettings }
                                        ]
                                )
                        }
                } catch (error) {
                        console.log("Accelerometer availability error: ", error)
                        setIsAccelerometerAvailable(false)
                        setPermissionStatus('error')

                        // Use mock data for demo purposes
                        setCurrentStepCount(7500)
                }
        }

        // Load step history from Firebase
        const loadStepHistory = (uid) => {
                const db = getDatabase()
                const historyRef = ref(db, `users/${uid}/stepHistory`)

                onValue(historyRef, (snapshot) => {
                        if (snapshot.exists()) {
                                const data = snapshot.val()
                                const historyArray = Object.keys(data).map(key => ({
                                        id: key,
                                        ...data[key]
                                }))

                                // Sort by date
                                historyArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

                                // Get the last 7 days for weekly view
                                const last7Days = historyArray.slice(-7)
                                setStepHistory(last7Days)
                        }
                })
        }

        // Save current step count to Firebase
        const saveStepCount = () => {
                if (!userId) return

                const db = getDatabase()
                const today = new Date().toISOString().split('T')[0]
                const stepCountRef = ref(db, `users/${userId}/stepHistory/${today.replace(/-/g, '')}`)

                set(stepCountRef, {
                        date: today,
                        steps: currentStepCount,
                        timestamp: serverTimestamp()
                })
        }

        const subscribe = () => {
                try {
                        // Set up accelerometer to count steps
                        const subscription = Accelerometer.addListener(({ y }) => {
                                const threshold = 0.1
                                const timestamp = new Date().getTime()

                                if (
                                        Math.abs(y - lastY) > threshold &&
                                        !isCounting &&
                                        timestamp - lastTimestamp > 800
                                ) {
                                        setIsCounting(true)
                                        setLastY(y)
                                        setLastTimestamp(timestamp)
                                        setCurrentStepCount(prevSteps => {
                                                const newCount = prevSteps + 1

                                                // Save to Firebase after steps update (throttled)
                                                setTimeout(() => saveStepCount(), 1000)

                                                return newCount
                                        })

                                        // Reset isCounting after delay to prevent multiple counts for one step
                                        setTimeout(() => setIsCounting(false), 1200)
                                }
                        })

                        setSubscription(subscription)
                } catch (error) {
                        console.log("Accelerometer subscription error: ", error)
                        // Use mock data for demo purposes
                        setCurrentStepCount(7500)

                        // For demo purposes, simulate step increases if accelerometer is not available
                        if (!isAccelerometerAvailable) {
                                const interval = setInterval(() => {
                                        setCurrentStepCount(prevCount => {
                                                const increment = Math.floor(Math.random() * 10) + 1
                                                const newCount = prevCount + increment
                                                return newCount
                                        })
                                }, 5000)

                                return () => clearInterval(interval)
                        }
                }
        }

        const unsubscribe = () => {
                subscription && subscription.remove()
                setSubscription(null)
        }

        // Save steps before app closes
        useEffect(() => {
                // Save current steps when component unmounts
                return () => {
                        if (currentStepCount > 0) {
                                saveStepCount()
                        }
                }
        }, [currentStepCount, userId])

        const getChartData = () => {
                let data

                if (timeFrame === "daily") {
                        // For daily, show hourly breakdown (mock data)
                        data = {
                                labels: ["6am", "9am", "12pm", "3pm", "6pm", "9pm"],
                                datasets: [
                                        {
                                                data: [500, 1200, 2500, 4000, 6000, 7500],
                                                color: () => colors.steps,
                                                strokeWidth: 2,
                                        },
                                ],
                        }
                } else if (timeFrame === "weekly") {
                        // For weekly, show last 7 days
                        data = {
                                labels: stepHistory.map((day) => day.date.split("-")[2]),
                                datasets: [
                                        {
                                                data: stepHistory.map((day) => day.steps),
                                                color: () => colors.steps,
                                                strokeWidth: 2,
                                        },
                                ],
                        }
                } else {
                        // For monthly, show last 30 days (simplified to weeks here)
                        data = {
                                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                                datasets: [
                                        {
                                                data: [52000, 63000, 48000, 57000],
                                                color: () => colors.steps,
                                                strokeWidth: 2,
                                        },
                                ],
                        }
                }

                return data
        }

        const getAverageSteps = () => {
                if (timeFrame === "daily") {
                        return currentStepCount
                } else if (timeFrame === "weekly") {
                        const sum = stepHistory.reduce((acc, day) => acc + day.steps, 0)
                        return Math.round(sum / stepHistory.length)
                } else {
                        return 8500 // Mock data for monthly average
                }
        }

        const getProgressPercentage = () => {
                return Math.min(100, (currentStepCount / dailyGoal) * 100)
        }

        // Render a permission request screen if permission not granted
        if (permissionStatus === 'denied') {
                return (
                        <SafeAreaView style={styles.permissionContainer}>
                                <Card containerStyle={styles.permissionCard}>
                                        <Icon name="alert-circle" type="feather" size={60} color={colors.warning} />
                                        <Text style={styles.permissionTitle}>Permission Required</Text>
                                        <Text style={styles.permissionText}>
                                                This app needs permission to access your motion data to count steps.
                                                Without this permission, the step counter will not work accurately.
                                        </Text>
                                        <Button
                                                title="Request Permission"
                                                buttonStyle={styles.permissionButton}
                                                onPress={checkAndRequestPermissions}
                                        />
                                </Card>
                        </SafeAreaView>
                )
        }

        return (
                <SafeAreaView style={styles.container}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                                <Card containerStyle={styles.mainCard}>
                                        <View style={styles.stepCountContainer}>
                                                <View style={styles.progressRingContainer}>
                                                        <View style={styles.progressRing}>
                                                                <View
                                                                        style={[
                                                                                styles.progressFill,
                                                                                {
                                                                                        width: `${getProgressPercentage()}%`,
                                                                                        backgroundColor: getProgressPercentage() >= 100 ? colors.success : colors.steps,
                                                                                },
                                                                        ]}
                                                                />
                                                        </View>
                                                        <View style={styles.stepCountTextContainer}>
                                                                <Text style={styles.stepCountText}>{currentStepCount}</Text>
                                                                <Text style={styles.stepGoalText}>/ {dailyGoal}</Text>
                                                        </View>
                                                </View>
                                                <Text style={styles.stepsLabel}>Steps Today</Text>

                                                <View style={styles.statsContainer}>
                                                        <View style={styles.statItem}>
                                                                <Icon name="fire" type="material-community" size={24} color="#FF7043" />
                                                                <Text style={styles.statValue}>{Math.round(currentStepCount * 0.04)}</Text>
                                                                <Text style={styles.statLabel}>Calories</Text>
                                                        </View>
                                                        <View style={styles.statItem}>
                                                                <Icon name="map-marker-distance" type="material-community" size={24} color="#5C6BC0" />
                                                                <Text style={styles.statValue}>{(currentStepCount * 0.0007).toFixed(1)}</Text>
                                                                <Text style={styles.statLabel}>Kilometers</Text>
                                                        </View>
                                                        <View style={styles.statItem}>
                                                                <Icon name="clock" type="feather" size={24} color="#66BB6A" />
                                                                <Text style={styles.statValue}>{Math.round(currentStepCount * 0.01)}</Text>
                                                                <Text style={styles.statLabel}>Minutes</Text>
                                                        </View>
                                                </View>
                                        </View>
                                </Card>

                                <Card containerStyle={styles.card}>
                                        <Card.Title>Step History</Card.Title>
                                        <Card.Divider />

                                        <View style={styles.timeFrameContainer}>
                                                <TouchableOpacity
                                                        style={[styles.timeFrameButton, timeFrame === "daily" && styles.timeFrameButtonActive]}
                                                        onPress={() => setTimeFrame("daily")}
                                                >
                                                        <Text style={timeFrame === "daily" ? styles.timeFrameTextActive : styles.timeFrameText}>Daily</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.timeFrameButton, timeFrame === "weekly" && styles.timeFrameButtonActive]}
                                                        onPress={() => setTimeFrame("weekly")}
                                                >
                                                        <Text style={timeFrame === "weekly" ? styles.timeFrameTextActive : styles.timeFrameText}>Weekly</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.timeFrameButton, timeFrame === "monthly" && styles.timeFrameButtonActive]}
                                                        onPress={() => setTimeFrame("monthly")}
                                                >
                                                        <Text style={timeFrame === "monthly" ? styles.timeFrameTextActive : styles.timeFrameText}>Monthly</Text>
                                                </TouchableOpacity>
                                        </View>

                                        <View style={styles.averageContainer}>
                                                <Text style={styles.averageLabel}>Average Steps:</Text>
                                                <Text style={styles.averageValue}>{getAverageSteps()}</Text>
                                        </View>

                                        <LineChart
                                                data={getChartData()}
                                                width={Dimensions.get("window").width - 60}
                                                height={220}
                                                chartConfig={{
                                                        backgroundColor: "#ffffff",
                                                        backgroundGradientFrom: "#ffffff",
                                                        backgroundGradientTo: "#ffffff",
                                                        decimalPlaces: 0,
                                                        color: () => colors.steps,
                                                        labelColor: () => "#333333",
                                                        style: {
                                                                borderRadius: 16,
                                                        },
                                                        propsForDots: {
                                                                r: "6",
                                                                strokeWidth: "2",
                                                                stroke: colors.steps,
                                                        },
                                                }}
                                                bezier
                                                style={styles.chart}
                                        />
                                </Card>

                                <Card containerStyle={styles.card}>
                                        <Card.Title>Activity Insights</Card.Title>
                                        <Card.Divider />

                                        <View style={styles.insightItem}>
                                                <Icon
                                                        name="trending-up"
                                                        type="feather"
                                                        size={24}
                                                        color={colors.success}
                                                        containerStyle={styles.insightIcon}
                                                />
                                                <View style={styles.insightContent}>
                                                        <Text style={styles.insightTitle}>15% More Active</Text>
                                                        <Text style={styles.insightText}>You're walking more this week compared to last week. Keep it up!</Text>
                                                </View>
                                        </View>

                                        <View style={styles.insightItem}>
                                                <Icon name="award" type="feather" size={24} color="#FFC107" containerStyle={styles.insightIcon} />
                                                <View style={styles.insightContent}>
                                                        <Text style={styles.insightTitle}>Goal Reached 3 Times</Text>
                                                        <Text style={styles.insightText}>You've reached your daily step goal 3 times this week.</Text>
                                                </View>
                                        </View>

                                        <View style={styles.insightItem}>
                                                <Icon name="heart" type="feather" size={24} color={colors.error} containerStyle={styles.insightIcon} />
                                                <View style={styles.insightContent}>
                                                        <Text style={styles.insightTitle}>Health Benefit</Text>
                                                        <Text style={styles.insightText}>
                                                                Regular walking helps improve blood sugar control and cardiovascular health.
                                                        </Text>
                                                </View>
                                        </View>
                                </Card>

                                {!isAccelerometerAvailable && (
                                        <Card containerStyle={[styles.card, styles.warningCard]}>
                                                <View style={styles.warningContainer}>
                                                        <Icon name="alert-circle" type="feather" size={24} color={colors.warning} />
                                                        <Text style={styles.warningText}>
                                                                Accelerometer is not available on this device. Using simulated data for demonstration.
                                                        </Text>
                                                </View>
                                        </Card>
                                )}

                                {/* Add padding at the bottom to ensure scrolling works well */}
                                <View style={styles.bottomPadding} />
                        </ScrollView>
                </SafeAreaView>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: "#f8f9fa",
        },
        scrollContent: {
                paddingBottom: 20, // Ensure there's space at the bottom
        },
        mainCard: {
                borderRadius: 10,
                marginBottom: 15,
                padding: 20,
                marginTop: 10,
        },
        card: {
                borderRadius: 10,
                marginBottom: 15,
        },
        stepCountContainer: {
                alignItems: "center",
        },
        progressRingContainer: {
                position: "relative",
                width: 200,
                height: 200,
                justifyContent: "center",
                alignItems: "center",
        },
        progressRing: {
                position: "absolute",
                width: "100%",
                height: 20,
                borderRadius: 10,
                backgroundColor: "#e0e0e0",
                overflow: "hidden",
                transform: [{ rotate: "90deg" }],
        },
        progressFill: {
                height: "100%",
        },
        stepCountTextContainer: {
                flexDirection: "row",
                alignItems: "baseline",
        },
        stepCountText: {
                fontSize: 48,
                fontWeight: "bold",
                color: colors.steps,
        },
        stepGoalText: {
                fontSize: 20,
                color: "#888",
                marginLeft: 5,
        },
        stepsLabel: {
                fontSize: 18,
                color: "#666",
                marginTop: 10,
        },
        statsContainer: {
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
                marginTop: 20,
        },
        statItem: {
                alignItems: "center",
        },
        statValue: {
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
        },
        statLabel: {
                fontSize: 12,
                color: "#888",
        },
        timeFrameContainer: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 15,
        },
        timeFrameButton: {
                flex: 1,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                borderRadius: 5,
                marginHorizontal: 3,
                alignItems: "center",
        },
        timeFrameButtonActive: {
                backgroundColor: colors.steps,
                borderColor: colors.steps,
        },
        timeFrameText: {
                color: "#666",
        },
        timeFrameTextActive: {
                color: "#fff",
                fontWeight: "bold",
        },
        averageContainer: {
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
        },
        averageLabel: {
                fontSize: 16,
                color: "#666",
        },
        averageValue: {
                fontSize: 18,
                fontWeight: "bold",
                color: colors.steps,
                marginLeft: 5,
        },
        chart: {
                marginVertical: 15,
                borderRadius: 16,
        },
        insightItem: {
                flexDirection: "row",
                marginVertical: 10,
        },
        insightIcon: {
                marginRight: 10,
        },
        insightContent: {
                flex: 1,
        },
        insightTitle: {
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 5,
        },
        insightText: {
                color: "#666",
        },
        warningCard: {
                backgroundColor: "#fff9e6",
        },
        warningContainer: {
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
        },
        warningText: {
                marginLeft: 10,
                color: "#666",
                flex: 1,
        },
        bottomPadding: {
                height: 30,
        },
        // Permission screen styles
        permissionContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: "#f8f9fa",
        },
        permissionCard: {
                borderRadius: 10,
                padding: 20,
                alignItems: 'center',
                width: '90%',
        },
        permissionTitle: {
                fontSize: 22,
                fontWeight: 'bold',
                marginTop: 20,
                marginBottom: 10,
        },
        permissionText: {
                fontSize: 16,
                textAlign: 'center',
                color: '#666',
                marginBottom: 20,
        },
        permissionButton: {
                backgroundColor: colors.steps,
                paddingHorizontal: 30,
                borderRadius: 8,
        },
})