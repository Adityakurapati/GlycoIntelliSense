"use client"

import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet } from "react-native"
import { Text, Card, Button, Icon } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"

import type { BloodSugarReading, Reminder, Goal } from "../types"
import { colors } from "../constants/theme"

// Mock data - in a real app, this would come from a database or API
const mockBloodSugarReadings: BloodSugarReading[] = [
  { id: "1", value: 120, timestamp: new Date(2023, 3, 1), mealStatus: "fasting" },
  { id: "2", value: 145, timestamp: new Date(2023, 3, 2), mealStatus: "after" },
  { id: "3", value: 110, timestamp: new Date(2023, 3, 3), mealStatus: "before" },
  { id: "4", value: 130, timestamp: new Date(2023, 3, 4), mealStatus: "after" },
  { id: "5", value: 105, timestamp: new Date(2023, 3, 5), mealStatus: "fasting" },
  { id: "6", value: 125, timestamp: new Date(2023, 3, 6), mealStatus: "before" },
  { id: "7", value: 140, timestamp: new Date(2023, 3, 7), mealStatus: "after" },
]

const mockReminders: Reminder[] = [
  {
    id: "1",
    type: "medication",
    title: "Take Metformin",
    description: "500mg with breakfast",
    date: new Date(2023, 3, 8, 8, 0),
    recurring: true,
    recurrencePattern: "daily",
    completed: false,
  },
  {
    id: "2",
    type: "checkup",
    title: "Doctor Appointment",
    description: "Annual checkup with Dr. Smith",
    date: new Date(2023, 3, 15, 10, 30),
    recurring: false,
    completed: false,
  },
]

const mockGoals: Goal[] = [
  {
    id: "1",
    type: "steps",
    target: 10000,
    unit: "steps",
    startDate: new Date(2023, 3, 1),
    progress: 7500,
    completed: false,
  },
  {
    id: "2",
    type: "bloodSugar",
    target: 120,
    unit: "mg/dL",
    startDate: new Date(2023, 3, 1),
    progress: 125,
    completed: false,
  },
]

export default function HomeScreen({ navigation }: any) {
  const [bloodSugarData, setBloodSugarData] = useState<BloodSugarReading[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch data from API or local storage
    setBloodSugarData(mockBloodSugarReadings)
    setReminders(mockReminders)
    setGoals(mockGoals)
    setLoading(false)
  }, [])

  const getAverageBloodSugar = () => {
    if (bloodSugarData.length === 0) return 0
    const sum = bloodSugarData.reduce((acc, reading) => acc + reading.value, 0)
    return Math.round(sum / bloodSugarData.length)
  }

  const getHighestBloodSugar = () => {
    if (bloodSugarData.length === 0) return 0
    return Math.max(...bloodSugarData.map((reading) => reading.value))
  }

  const getLowestBloodSugar = () => {
    if (bloodSugarData.length === 0) return 0
    return Math.min(...bloodSugarData.map((reading) => reading.value))
  }

  const getBloodSugarChartData = () => {
    return {
      labels: bloodSugarData.map((reading) => {
        const date = new Date(reading.timestamp)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      datasets: [
        {
          data: bloodSugarData.map((reading) => reading.value),
          color: () => colors.bloodSugar,
          strokeWidth: 2,
        },
      ],
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Welcome to GlycoIntelliSense</Text>
          <Text>Your diabetes management companion</Text>
        </View>

        <Card containerStyle={styles.card}>
          <Card.Title>Blood Sugar Overview</Card.Title>
          <Card.Divider />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getAverageBloodSugar()}</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getHighestBloodSugar()}</Text>
              <Text style={styles.statLabel}>Highest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getLowestBloodSugar()}</Text>
              <Text style={styles.statLabel}>Lowest</Text>
            </View>
          </View>

          {bloodSugarData.length > 0 && (
            <LineChart
              data={getBloodSugarChartData()}
              width={Dimensions.get("window").width - 60}
              height={180}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: () => colors.bloodSugar,
                labelColor: () => "#333333",
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.bloodSugar,
                },
              }}
              bezier
              style={styles.chart}
            />
          )}

          <Button
            title="Track Blood Sugar"
            icon={<Icon name="droplet" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
            onPress={() => navigation.navigate("BloodSugar")}
          />
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>Today's Goals</Card.Title>
          <Card.Divider />
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{goal.type === "steps" ? "Daily Steps" : "Blood Sugar Target"}</Text>
                <Text>
                  {goal.progress} / {goal.target} {goal.unit}
                </Text>
              </View>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, (goal.progress / goal.target) * 100)}%`,
                      backgroundColor: goal.type === "steps" ? colors.steps : colors.bloodSugar,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
          <Button
            title="View All Goals"
            type="outline"
            icon={<Icon name="target" type="feather" color={colors.primary} style={{ marginRight: 10 }} />}
            onPress={() => navigation.navigate("Goals")}
          />
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>Upcoming Reminders</Card.Title>
          <Card.Divider />
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderItem}>
              <Icon
                name={reminder.type === "medication" ? "pill" : "calendar"}
                type="material-community"
                color={reminder.type === "medication" ? colors.medication : colors.appointment}
                size={24}
                containerStyle={styles.reminderIcon}
              />
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderDescription}>{reminder.description}</Text>
                <Text style={styles.reminderDate}>
                  {reminder.date.toLocaleDateString()} at{" "}
                  {reminder.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
          ))}
          <Button
            title="Manage Reminders"
            type="outline"
            icon={<Icon name="bell" type="feather" color={colors.primary} style={{ marginRight: 10 }} />}
            onPress={() => navigation.navigate("More", { screen: "Medication" })}
          />
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>Quick Actions</Card.Title>
          <Card.Divider />
          <View style={styles.quickActionsContainer}>
            <Button
              title="Book Test"
              icon={<Icon name="calendar-plus" type="material-community" color="#ffffff" />}
              containerStyle={styles.quickActionButton}
              onPress={() => navigation.navigate("Appointments")}
            />
            <Button
              title="Nutrition"
              icon={<Icon name="food-apple" type="material-community" color="#ffffff" />}
              containerStyle={styles.quickActionButton}
              onPress={() => navigation.navigate("More", { screen: "Nutrition" })}
            />
            <Button
              title="Health Risk"
              icon={<Icon name="alert-circle" type="material-community" color="#ffffff" />}
              containerStyle={styles.quickActionButton}
              onPress={() => navigation.navigate("More", { screen: "HealthRisk" })}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 15,
    alignItems: "center",
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.bloodSugar,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  chart: {
    marginVertical: 15,
    borderRadius: 16,
  },
  goalItem: {
    marginBottom: 15,
  },
  goalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  goalTitle: {
    fontWeight: "bold",
  },
  progressContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  reminderItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  reminderIcon: {
    marginRight: 10,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  reminderDescription: {
    color: "#666",
  },
  reminderDate: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
})

