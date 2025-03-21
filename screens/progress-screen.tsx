"use client"

import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet, Dimensions } from "react-native"
import { Text, Card, Icon } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import { LineChart, BarChart } from "react-native-chart-kit"
import { format, subDays } from "date-fns"

import type { BloodSugarReading, Goal } from "../types"
import { colors } from "../constants/theme"

// Mock data - in a real app, this would come from a database or API
const mockBloodSugarReadings: BloodSugarReading[] = [
  { id: "1", value: 120, timestamp: subDays(new Date(), 30), mealStatus: "fasting" },
  { id: "2", value: 145, timestamp: subDays(new Date(), 28), mealStatus: "after" },
  { id: "3", value: 110, timestamp: subDays(new Date(), 26), mealStatus: "before" },
  { id: "4", value: 130, timestamp: subDays(new Date(), 24), mealStatus: "after" },
  { id: "5", value: 105, timestamp: subDays(new Date(), 22), mealStatus: "fasting" },
  { id: "6", value: 125, timestamp: subDays(new Date(), 20), mealStatus: "before" },
  { id: "7", value: 140, timestamp: subDays(new Date(), 18), mealStatus: "after" },
  { id: "8", value: 115, timestamp: subDays(new Date(), 16), mealStatus: "fasting" },
  { id: "9", value: 135, timestamp: subDays(new Date(), 14), mealStatus: "after" },
  { id: "10", value: 108, timestamp: subDays(new Date(), 12), mealStatus: "before" },
  { id: "11", value: 128, timestamp: subDays(new Date(), 10), mealStatus: "after" },
  { id: "12", value: 102, timestamp: subDays(new Date(), 8), mealStatus: "fasting" },
  { id: "13", value: 122, timestamp: subDays(new Date(), 6), mealStatus: "before" },
  { id: "14", value: 138, timestamp: subDays(new Date(), 4), mealStatus: "after" },
  { id: "15", value: 112, timestamp: subDays(new Date(), 2), mealStatus: "fasting" },
  { id: "16", value: 132, timestamp: new Date(), mealStatus: "after" },
]

const mockGoals: Goal[] = [
  {
    id: "1",
    type: "steps",
    target: 10000,
    unit: "steps",
    startDate: subDays(new Date(), 30),
    progress: 9500,
    completed: false,
  },
  {
    id: "2",
    type: "bloodSugar",
    target: 120,
    unit: "mg/dL",
    startDate: subDays(new Date(), 30),
    progress: 118,
    completed: true,
  },
  {
    id: "3",
    type: "sleep",
    target: 8,
    unit: "hours",
    startDate: subDays(new Date(), 30),
    progress: 7.5,
    completed: false,
  },
]

// Mock milestones
const mockMilestones = [
  {
    id: "1",
    title: "Lowest Blood Sugar",
    value: "102 mg/dL",
    date: subDays(new Date(), 8),
    icon: "trending-down",
    color: colors.success,
  },
  {
    id: "2",
    title: "Most Steps in a Day",
    value: "12,543 steps",
    date: subDays(new Date(), 15),
    icon: "trending-up",
    color: colors.steps,
  },
  {
    id: "3",
    title: "First Goal Completed",
    value: "Blood Sugar Target",
    date: subDays(new Date(), 20),
    icon: "award",
    color: "#FFC107",
  },
  {
    id: "4",
    title: "Consistent Medication",
    value: "30 days streak",
    date: new Date(),
    icon: "check-circle",
    color: colors.medication,
  },
]

export default function ProgressScreen() {
  const [bloodSugarData, setBloodSugarData] = useState<BloodSugarReading[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch data from API or local storage
    setBloodSugarData(mockBloodSugarReadings)
    setGoals(mockGoals)
    setMilestones(mockMilestones)
    setLoading(false)
  }, [])

  const getBloodSugarTrend = () => {
    // Group by week for the chart
    const weeks: { [key: string]: number[] } = {}

    bloodSugarData.forEach((reading) => {
      const date = new Date(reading.timestamp)
      const weekNum = Math.floor(date.getDate() / 7) + 1
      const weekKey = `Week ${weekNum}`

      if (!weeks[weekKey]) {
        weeks[weekKey] = []
      }

      weeks[weekKey].push(reading.value)
    })

    const labels = Object.keys(weeks)
    const data = labels.map((week) => {
      const values = weeks[week]
      return values.reduce((sum, val) => sum + val, 0) / values.length
    })

    return {
      labels,
      datasets: [
        {
          data,
          color: () => colors.bloodSugar,
          strokeWidth: 2,
        },
      ],
    }
  }

  const getGoalProgress = () => {
    return {
      labels: goals.map((goal) => {
        switch (goal.type) {
          case "steps":
            return "Steps"
          case "bloodSugar":
            return "Blood Sugar"
          case "sleep":
            return "Sleep"
          default:
            return goal.type
        }
      }),
      datasets: [
        {
          data: goals.map((goal) => {
            // For blood sugar, lower can be better, so calculate inverse percentage
            if (goal.type === "bloodSugar") {
              return goal.target >= goal.progress ? 100 : (goal.target / goal.progress) * 100
            }
            // For others, higher is better
            return (goal.progress / goal.target) * 100
          }),
        },
      ],
    }
  }

  const getGoalColor = (index: number) => {
    const goalColors = [colors.steps, colors.bloodSugar, colors.sleep]
    return goalColors[index % goalColors.length]
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Your Progress</Text>
          <Text>Track your health journey over time</Text>
        </View>

        <Card containerStyle={styles.card}>
          <Card.Title>Blood Sugar Trend (30 Days)</Card.Title>
          <Card.Divider />

          <LineChart
            data={getBloodSugarTrend()}
            width={Dimensions.get("window").width - 60}
            height={220}
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

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.min(...bloodSugarData.map((reading) => reading.value))}</Text>
              <Text style={styles.statLabel}>Lowest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(bloodSugarData.reduce((sum, reading) => sum + reading.value, 0) / bloodSugarData.length)}
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.max(...bloodSugarData.map((reading) => reading.value))}</Text>
              <Text style={styles.statLabel}>Highest</Text>
            </View>
          </View>

          <Text style={styles.insightText}>
            Your blood sugar levels have been relatively stable over the past month, with a slight downward trend, which
            is positive.
          </Text>
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>Goal Progress</Card.Title>
          <Card.Divider />

          <BarChart
            data={getGoalProgress()}
            width={Dimensions.get("window").width - 60}
            height={220}
            yAxisSuffix="%"
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1, index) => {
                return getGoalColor(index || 0)
              },
              labelColor: () => "#333333",
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.7,
            }}
            style={styles.chart}
          />

          {goals.map((goal, index) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleContainer}>
                  <Icon
                    name={goal.type === "steps" ? "walk" : goal.type === "sleep" ? "sleep" : "droplet"}
                    type={goal.type === "droplet" ? "feather" : "material-community"}
                    size={24}
                    color={getGoalColor(index)}
                  />
                  <Text style={styles.goalTitle}>
                    {goal.type === "steps"
                      ? "Daily Steps"
                      : goal.type === "sleep"
                        ? "Sleep Duration"
                        : "Blood Sugar Target"}
                  </Text>
                </View>
                <Text style={[styles.goalStatus, { color: goal.completed ? colors.success : colors.warning }]}>
                  {goal.completed ? "Completed" : "In Progress"}
                </Text>
              </View>

              <View style={styles.goalDetails}>
                <Text style={styles.goalProgress}>
                  {goal.progress} / {goal.target} {goal.unit}
                </Text>
                <Text style={styles.goalDate}>Started: {format(new Date(goal.startDate), "MMM d, yyyy")}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, (goal.progress / goal.target) * 100)}%`,
                      backgroundColor: getGoalColor(index),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>Milestones</Card.Title>
          <Card.Divider />

          {milestones.map((milestone) => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={[styles.milestoneIconContainer, { backgroundColor: milestone.color }]}>
                <Icon name={milestone.icon} type="feather" size={24} color="#fff" />
              </View>

              <View style={styles.milestoneDetails}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <Text style={styles.milestoneValue}>{milestone.value}</Text>
                <Text style={styles.milestoneDate}>{format(new Date(milestone.date), "MMM d, yyyy")}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    margin: 20,
    borderRadius: 10,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  insightText: {
    marginTop: 15,
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
  },
  goalItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  goalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  goalStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  goalDetails: {
    marginBottom: 8,
  },
  goalProgress: {
    fontSize: 14,
    color: colors.text,
  },
  goalDate: {
    fontSize: 12,
    color: colors.secondary,
  },
  progressContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "0%",
    borderRadius: 5,
  },
  milestoneItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  milestoneIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  milestoneDetails: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  milestoneValue: {
    fontSize: 14,
    color: colors.text,
  },
  milestoneDate: {
    fontSize: 12,
    color: colors.secondary,
  },
})

