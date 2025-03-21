import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Text, Card, Button, Input, Icon, Divider, Badge } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"

import type { Goal } from "../types"
import { colors } from "../constants/theme"

// Mock data - in a real app, this would come from a database or API
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
        {
                id: "3",
                type: "sleep",
                target: 8,
                unit: "hours",
                startDate: new Date(2023, 3, 1),
                progress: 6.5,
                completed: false,
        },
        {
                id: "4",
                type: "weight",
                target: 75,
                unit: "kg",
                startDate: new Date(2023, 3, 1),
                progress: 78,
                completed: false,
        },
]

export default function GoalsScreen() {
        const [goals, setGoals] = useState<Goal[]>([])
        const [showAddGoal, setShowAddGoal] = useState(false)
        const [newGoalType, setNewGoalType] = useState<"steps" | "sleep" | "bloodSugar" | "weight" | "custom">("steps")
        const [newGoalTarget, setNewGoalTarget] = useState("")
        const [newGoalUnit, setNewGoalUnit] = useState("")
        const [loading, setLoading] = useState(true)
        const [completionRate, setCompletionRate] = useState(0)

        useEffect(() => {
                // In a real app, fetch data from API or local storage
                setGoals(mockGoals)
                setLoading(false)
        }, [])

        useEffect(() => {
                // Calculate completion rate whenever goals change
                calculateCompletionRate()
        }, [goals])

        const calculateCompletionRate = () => {
                if (goals.length === 0) {
                        setCompletionRate(0)
                        return
                }

                const completedGoalsCount = goals.filter(goal => {
                        // Determine if goal is completed based on progress
                        if (goal.type === "bloodSugar" || goal.type === "weight") {
                                return goal.progress <= goal.target
                        } else {
                                return goal.progress >= goal.target
                        }
                }).length

                const rate = Math.round((completedGoalsCount / goals.length) * 100)
                setCompletionRate(rate)
        }

        const getBadgeColor = (rate: number) => {
                if (rate >= 75) return "success"
                if (rate >= 50) return "primary"
                if (rate >= 25) return "warning"
                return "error"
        }

        const addGoal = () => {
                if (!newGoalTarget || isNaN(Number(newGoalTarget))) {
                        Alert.alert("Invalid Input", "Please enter a valid target value")
                        return
                }

                if (!newGoalUnit) {
                        Alert.alert("Invalid Input", "Please enter a unit")
                        return
                }

                const newGoal: Goal = {
                        id: Date.now().toString(),
                        type: newGoalType,
                        target: Number(newGoalTarget),
                        unit: newGoalUnit,
                        startDate: new Date(),
                        progress: 0,
                        completed: false,
                }

                setGoals([...goals, newGoal])
                setNewGoalTarget("")
                setNewGoalUnit("")
                setShowAddGoal(false)

                Alert.alert("Success", "Goal added successfully")
        }

        const getGoalIcon = (type: string) => {
                switch (type) {
                        case "steps":
                                return <Icon name="walk" type="material-community" size={24} color={colors.steps} />
                        case "sleep":
                                return <Icon name="sleep" type="material-community" size={24} color={colors.sleep} />
                        case "bloodSugar":
                                return <Icon name="droplet" type="feather" size={24} color={colors.bloodSugar} />
                        case "weight":
                                return <Icon name="weight" type="material-community" size={24} color="#5C6BC0" />
                        default:
                                return <Icon name="target" type="feather" size={24} color="#4CAF50" />
                }
        }

        const getGoalTitle = (type: string) => {
                switch (type) {
                        case "steps":
                                return "Daily Steps"
                        case "sleep":
                                return "Sleep Duration"
                        case "bloodSugar":
                                return "Blood Sugar Target"
                        case "weight":
                                return "Weight Goal"
                        default:
                                return "Custom Goal"
                }
        }

        const getProgressColor = (goal: Goal) => {
                if (goal.type === "bloodSugar" || goal.type === "weight") {
                        // For blood sugar and weight, lower can be better
                        return goal.progress <= goal.target ? colors.success : colors.warning
                } else {
                        // For steps and sleep, higher is better
                        return goal.progress >= goal.target ? colors.success : colors.warning
                }
        }

        const getProgressPercentage = (goal: Goal) => {
                if (goal.type === "bloodSugar" || goal.type === "weight") {
                        // For blood sugar and weight, calculate inverse percentage (lower is better)
                        const percentage = (goal.target / goal.progress) * 100
                        return Math.min(100, percentage)
                } else {
                        // For steps and sleep, calculate direct percentage (higher is better)
                        const percentage = (goal.progress / goal.target) * 100
                        return Math.min(100, percentage)
                }
        }

        return (
                <SafeAreaView style={styles.container}>
                        <ScrollView>
                                <View style={styles.header}>
                                        <View style={styles.headerLeft}>
                                                <Text h4>Your Health Goals</Text>
                                                <View style={styles.badgeContainer}>
                                                        <Badge
                                                                value={`${completionRate}%`}
                                                                status={getBadgeColor(completionRate)}
                                                                containerStyle={styles.badge}
                                                        />
                                                        <Text style={styles.badgeLabel}>Completion</Text>
                                                </View>
                                        </View>
                                        <Button
                                                icon={<Icon name="plus" type="feather" color="#ffffff" />}
                                                onPress={() => setShowAddGoal(!showAddGoal)}
                                                buttonStyle={styles.addButton}
                                        />
                                </View>

                                {showAddGoal && (
                                        <Card containerStyle={styles.card}>
                                                <Card.Title>Add New Goal</Card.Title>
                                                <Card.Divider />

                                                <Text style={styles.label}>Goal Type</Text>
                                                <View style={styles.goalTypeContainer}>
                                                        <TouchableOpacity
                                                                style={[styles.goalTypeButton, newGoalType === "steps" && styles.goalTypeButtonActive]}
                                                                onPress={() => {
                                                                        setNewGoalType("steps")
                                                                        setNewGoalUnit("steps")
                                                                }}
                                                        >
                                                                <Icon
                                                                        name="walk"
                                                                        type="material-community"
                                                                        size={24}
                                                                        color={newGoalType === "steps" ? "#fff" : colors.steps}
                                                                />
                                                                <Text style={newGoalType === "steps" ? styles.goalTypeTextActive : styles.goalTypeText}>Steps</Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                                style={[styles.goalTypeButton, newGoalType === "sleep" && styles.goalTypeButtonActive]}
                                                                onPress={() => {
                                                                        setNewGoalType("sleep")
                                                                        setNewGoalUnit("hours")
                                                                }}
                                                        >
                                                                <Icon
                                                                        name="sleep"
                                                                        type="material-community"
                                                                        size={24}
                                                                        color={newGoalType === "sleep" ? "#fff" : colors.sleep}
                                                                />
                                                                <Text style={newGoalType === "sleep" ? styles.goalTypeTextActive : styles.goalTypeText}>Sleep</Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                                style={[styles.goalTypeButton, newGoalType === "bloodSugar" && styles.goalTypeButtonActive]}
                                                                onPress={() => {
                                                                        setNewGoalType("bloodSugar")
                                                                        setNewGoalUnit("mg/dL")
                                                                }}
                                                        >
                                                                <Icon
                                                                        name="droplet"
                                                                        type="feather"
                                                                        size={24}
                                                                        color={newGoalType === "bloodSugar" ? "#fff" : colors.bloodSugar}
                                                                />
                                                                <Text style={newGoalType === "bloodSugar" ? styles.goalTypeTextActive : styles.goalTypeText}>
                                                                        Blood Sugar
                                                                </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                                style={[styles.goalTypeButton, newGoalType === "weight" && styles.goalTypeButtonActive]}
                                                                onPress={() => {
                                                                        setNewGoalType("weight")
                                                                        setNewGoalUnit("kg")
                                                                }}
                                                        >
                                                                <Icon
                                                                        name="weight"
                                                                        type="material-community"
                                                                        size={24}
                                                                        color={newGoalType === "weight" ? "#fff" : "#5C6BC0"}
                                                                />
                                                                <Text style={newGoalType === "weight" ? styles.goalTypeTextActive : styles.goalTypeText}>Weight</Text>
                                                        </TouchableOpacity>
                                                </View>

                                                <Input
                                                        label="Target Value"
                                                        placeholder="Enter target value"
                                                        keyboardType="numeric"
                                                        value={newGoalTarget}
                                                        onChangeText={setNewGoalTarget}
                                                />

                                                <Input label="Unit" placeholder="Enter unit" value={newGoalUnit} onChangeText={setNewGoalUnit} />

                                                <View style={styles.buttonContainer}>
                                                        <Button
                                                                title="Cancel"
                                                                type="outline"
                                                                onPress={() => setShowAddGoal(false)}
                                                                containerStyle={styles.buttonHalf}
                                                        />
                                                        <Button title="Add Goal" onPress={addGoal} containerStyle={styles.buttonHalf} />
                                                </View>
                                        </Card>
                                )}

                                <Card containerStyle={styles.card}>
                                        <Card.Title>Active Goals</Card.Title>
                                        <Card.Divider />

                                        {goals
                                                .filter((goal) => !goal.completed)
                                                .map((goal, index) => (
                                                        <View key={goal.id}>
                                                                <View style={styles.goalItem}>
                                                                        <View style={styles.goalHeader}>
                                                                                <View style={styles.goalTitleContainer}>
                                                                                        {getGoalIcon(goal.type)}
                                                                                        <Text style={styles.goalTitle}>{getGoalTitle(goal.type)}</Text>
                                                                                </View>
                                                                                <TouchableOpacity>
                                                                                        <Icon name="more-vertical" type="feather" size={20} color="#888" />
                                                                                </TouchableOpacity>
                                                                        </View>

                                                                        <View style={styles.goalDetails}>
                                                                                <Text style={styles.goalProgress}>
                                                                                        {goal.progress} / {goal.target} {goal.unit}
                                                                                </Text>
                                                                                <Text style={styles.goalDate}>Started: {goal.startDate.toLocaleDateString()}</Text>
                                                                        </View>

                                                                        <View style={styles.progressContainer}>
                                                                                <View
                                                                                        style={[
                                                                                                styles.progressBar,
                                                                                                {
                                                                                                        width: `${getProgressPercentage(goal)}%`,
                                                                                                        backgroundColor: getProgressColor(goal),
                                                                                                },
                                                                                        ]}
                                                                                />
                                                                        </View>

                                                                        {/* Goal status indicator */}
                                                                        {getProgressPercentage(goal) >= 100 && (
                                                                                <View style={styles.completedBadgeContainer}>
                                                                                        <Badge status="success" value="Completed" />
                                                                                </View>
                                                                        )}
                                                                </View>
                                                                {index < goals.filter((goal) => !goal.completed).length - 1 && <Divider style={styles.divider} />}
                                                        </View>
                                                ))}

                                        {goals.filter((goal) => !goal.completed).length === 0 && (
                                                <Text style={styles.noDataText}>No active goals. Add a new goal to get started!</Text>
                                        )}
                                </Card>

                                <Card containerStyle={styles.card}>
                                        <Card.Title>Recommendations</Card.Title>
                                        <Card.Divider />

                                        <View style={styles.recommendationItem}>
                                                <Icon
                                                        name="lightbulb-on"
                                                        type="material-community"
                                                        size={24}
                                                        color="#FFC107"
                                                        containerStyle={styles.recommendationIcon}
                                                />
                                                <View style={styles.recommendationContent}>
                                                        <Text style={styles.recommendationTitle}>Increase Daily Steps</Text>
                                                        <Text style={styles.recommendationText}>
                                                                Try to walk for at least 30 minutes each day to help regulate blood sugar levels.
                                                        </Text>
                                                </View>
                                        </View>

                                        <Divider style={styles.divider} />

                                        <View style={styles.recommendationItem}>
                                                <Icon
                                                        name="food-apple"
                                                        type="material-community"
                                                        size={24}
                                                        color="#4CAF50"
                                                        containerStyle={styles.recommendationIcon}
                                                />
                                                <View style={styles.recommendationContent}>
                                                        <Text style={styles.recommendationTitle}>Balanced Diet</Text>
                                                        <Text style={styles.recommendationText}>
                                                                Include more fiber-rich foods in your diet to help manage blood sugar levels.
                                                        </Text>
                                                </View>
                                        </View>

                                        <Divider style={styles.divider} />

                                        <View style={styles.recommendationItem}>
                                                <Icon
                                                        name="sleep"
                                                        type="material-community"
                                                        size={24}
                                                        color={colors.sleep}
                                                        containerStyle={styles.recommendationIcon}
                                                />
                                                <View style={styles.recommendationContent}>
                                                        <Text style={styles.recommendationTitle}>Improve Sleep Quality</Text>
                                                        <Text style={styles.recommendationText}>
                                                                Aim for 7-8 hours of quality sleep each night to help regulate hormones.
                                                        </Text>
                                                </View>
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
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 15,
        },
        headerLeft: {
                flexDirection: "row",
                alignItems: "center",
        },
        badgeContainer: {
                marginLeft: 10,
                alignItems: "center",
        },
        badge: {
                padding: 2,
        },
        badgeLabel: {
                fontSize: 10,
                color: "#888",
                marginTop: 2,
        },
        addButton: {
                borderRadius: 30,
                width: 40,
                height: 40,
                padding: 0,
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
        label: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#86939e",
                marginBottom: 10,
        },
        goalTypeContainer: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 15,
        },
        goalTypeButton: {
                flex: 1,
                alignItems: "center",
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                borderRadius: 5,
                marginHorizontal: 3,
        },
        goalTypeButtonActive: {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
        },
        goalTypeText: {
                color: "#666",
                marginTop: 5,
                fontSize: 12,
        },
        goalTypeTextActive: {
                color: "#fff",
                marginTop: 5,
                fontSize: 12,
                fontWeight: "bold",
        },
        buttonContainer: {
                flexDirection: "row",
                justifyContent: "space-between",
        },
        buttonHalf: {
                flex: 1,
                marginHorizontal: 5,
        },
        goalItem: {
                marginVertical: 10,
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
                fontSize: 16,
                fontWeight: "bold",
                marginLeft: 10,
        },
        goalDetails: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
        },
        goalProgress: {
                fontSize: 14,
                color: "#666",
        },
        goalDate: {
                fontSize: 12,
                color: "#888",
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
        completedBadgeContainer: {
                alignItems: "flex-end",
                marginTop: 5,
        },
        divider: {
                marginVertical: 10,
        },
        noDataText: {
                textAlign: "center",
                color: "#888",
                marginVertical: 20,
        },
        recommendationItem: {
                flexDirection: "row",
                marginVertical: 10,
        },
        recommendationIcon: {
                marginRight: 10,
        },
        recommendationContent: {
                flex: 1,
        },
        recommendationTitle: {
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 5,
        },
        recommendationText: {
                color: "#666",
        },
})