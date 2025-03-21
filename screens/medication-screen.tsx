"use client"

import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Text, Card, Button, Input, Icon, Divider } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Notifications from "expo-notifications"
import { format } from "date-fns"

import type { Medication, Reminder } from "../types"
import { colors } from "../constants/theme"

// Mock data - in a real app, this would come from a database or API
const mockMedications: Medication[] = [
  {
    id: "1",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    startDate: new Date(2023, 0, 15),
    timeOfDay: ["Morning", "Evening"],
    notes: "Take with food to reduce stomach upset",
  },
  {
    id: "2",
    name: "Glipizide",
    dosage: "5mg",
    frequency: "Once daily",
    startDate: new Date(2023, 2, 10),
    timeOfDay: ["Morning"],
    notes: "Take 30 minutes before breakfast",
  },
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
  {
    id: "3",
    type: "bloodSugar",
    title: "Check Blood Sugar",
    description: "Before dinner",
    date: new Date(2023, 3, 7, 18, 0),
    recurring: true,
    recurrencePattern: "daily",
    completed: false,
  },
]

export default function MedicationScreen() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newMedName, setNewMedName] = useState("")
  const [newMedDosage, setNewMedDosage] = useState("")
  const [newMedFrequency, setNewMedFrequency] = useState("")
  const [newMedTimeOfDay, setNewMedTimeOfDay] = useState<string[]>([])
  const [newMedNotes, setNewMedNotes] = useState("")
  const [newReminderTitle, setNewReminderTitle] = useState("")
  const [newReminderType, setNewReminderType] = useState<"medication" | "checkup" | "bloodSugar" | "custom">(
    "medication",
  )
  const [newReminderDesc, setNewReminderDesc] = useState("")
  const [newReminderDate, setNewReminderDate] = useState("")
  const [newReminderTime, setNewReminderTime] = useState("")
  const [newReminderRecurring, setNewReminderRecurring] = useState(false)
  const [newReminderPattern, setNewReminderPattern] = useState("daily")
  const [activeTab, setActiveTab] = useState<"medications" | "reminders">("medications")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch data from API or local storage
    setMedications(mockMedications)
    setReminders(mockReminders)
    setLoading(false)
  }, [])

  const addMedication = () => {
    if (!newMedName || !newMedDosage || !newMedFrequency || newMedTimeOfDay.length === 0) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: newMedName,
      dosage: newMedDosage,
      frequency: newMedFrequency,
      startDate: new Date(),
      timeOfDay: newMedTimeOfDay,
      notes: newMedNotes,
    }

    setMedications([...medications, newMedication])
    resetMedicationForm()
    setShowAddMedication(false)

    // Create reminders for the medication
    newMedTimeOfDay.forEach((time) => {
      const reminderTime =
        time === "Morning" ? "08:00" : time === "Afternoon" ? "13:00" : time === "Evening" ? "18:00" : "21:00"

      const newReminder: Reminder = {
        id: Date.now().toString() + time,
        type: "medication",
        title: `Take ${newMedName}`,
        description: `${newMedDosage} ${time.toLowerCase()}`,
        date: new Date(),
        recurring: true,
        recurrencePattern: "daily",
        completed: false,
      }

      setReminders([...reminders, newReminder])

      // Schedule notification
      scheduleNotification(newReminder)
    })

    Alert.alert("Success", "Medication added successfully with reminders")
  }

  const addReminder = () => {
    if (!newReminderTitle || !newReminderDate || !newReminderTime) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    const [year, month, day] = newReminderDate.split("-").map(Number)
    const [hours, minutes] = newReminderTime.split(":").map(Number)

    const reminderDate = new Date(year, month - 1, day, hours, minutes)

    const newReminder: Reminder = {
      id: Date.now().toString(),
      type: newReminderType,
      title: newReminderTitle,
      description: newReminderDesc,
      date: reminderDate,
      recurring: newReminderRecurring,
      recurrencePattern: newReminderRecurring ? newReminderPattern : undefined,
      completed: false,
    }

    setReminders([...reminders, newReminder])
    resetReminderForm()
    setShowAddReminder(false)

    // Schedule notification
    scheduleNotification(newReminder)

    Alert.alert("Success", "Reminder added successfully")
  }

  const scheduleNotification = async (reminder: Reminder) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.description || "",
          data: { id: reminder.id },
        },
        trigger: {
          date: reminder.date,
          repeats: reminder.recurring,
        },
      })
    } catch (error) {
      console.log("Error scheduling notification:", error)
    }
  }

  const resetMedicationForm = () => {
    setNewMedName("")
    setNewMedDosage("")
    setNewMedFrequency("")
    setNewMedTimeOfDay([])
    setNewMedNotes("")
  }

  const resetReminderForm = () => {
    setNewReminderTitle("")
    setNewReminderType("medication")
    setNewReminderDesc("")
    setNewReminderDate("")
    setNewReminderTime("")
    setNewReminderRecurring(false)
    setNewReminderPattern("daily")
  }

  const toggleTimeOfDay = (time: string) => {
    if (newMedTimeOfDay.includes(time)) {
      setNewMedTimeOfDay(newMedTimeOfDay.filter((t) => t !== time))
    } else {
      setNewMedTimeOfDay([...newMedTimeOfDay, time])
    }
  }

  const markReminderComplete = (id: string) => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === id ? { ...reminder, completed: true } : reminder,
    )
    setReminders(updatedReminders)
  }

  const deleteMedication = (id: string) => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication? This will also remove associated reminders.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            setMedications(medications.filter((med) => med.id !== id))
            // Also remove associated reminders
            setReminders(
              reminders.filter(
                (rem) =>
                  !(rem.type === "medication" && rem.title.includes(medications.find((m) => m.id === id)?.name || "")),
              ),
            )
            Alert.alert("Success", "Medication deleted successfully")
          },
          style: "destructive",
        },
      ],
    )
  }

  const deleteReminder = (id: string) => {
    Alert.alert("Delete Reminder", "Are you sure you want to delete this reminder?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          setReminders(reminders.filter((rem) => rem.id !== id))
          Alert.alert("Success", "Reminder deleted successfully")
        },
        style: "destructive",
      },
    ])
  }

  const getUpcomingReminders = () => {
    const now = new Date()
    return reminders
      .filter((reminder) => !reminder.completed && new Date(reminder.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Icon name="pill" type="material-community" size={24} color={colors.medication} />
      case "checkup":
        return <Icon name="stethoscope" type="material-community" size={24} color="#5C6BC0" />
      case "bloodSugar":
        return <Icon name="droplet" type="feather" size={24} color={colors.bloodSugar} />
      default:
        return <Icon name="bell" type="feather" size={24} color="#4CAF50" />
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Medications & Reminders</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "medications" && styles.activeTabButton]}
            onPress={() => setActiveTab("medications")}
          >
            <Text style={activeTab === "medications" ? styles.activeTabText : styles.tabText}>Medications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "reminders" && styles.activeTabButton]}
            onPress={() => setActiveTab("reminders")}
          >
            <Text style={activeTab === "reminders" ? styles.activeTabText : styles.tabText}>Reminders</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "medications" ? (
          <>
            <View style={styles.actionButtonContainer}>
              <Button
                title="Add Medication"
                icon={<Icon name="plus" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
                onPress={() => setShowAddMedication(!showAddMedication)}
              />
            </View>

            {showAddMedication && (
              <Card containerStyle={styles.card}>
                <Card.Title>Add New Medication</Card.Title>
                <Card.Divider />

                <Input
                  label="Medication Name"
                  placeholder="Enter medication name"
                  value={newMedName}
                  onChangeText={setNewMedName}
                  leftIcon={<Icon name="pill" type="material-community" size={24} color={colors.medication} />}
                />

                <Input
                  label="Dosage"
                  placeholder="e.g., 500mg"
                  value={newMedDosage}
                  onChangeText={setNewMedDosage}
                  leftIcon={<Icon name="eyedropper" type="material-community" size={24} color="#888" />}
                />

                <Input
                  label="Frequency"
                  placeholder="e.g., Once daily, Twice daily"
                  value={newMedFrequency}
                  onChangeText={setNewMedFrequency}
                  leftIcon={<Icon name="repeat" type="feather" size={24} color="#888" />}
                />

                <Text style={styles.label}>Time of Day</Text>
                <View style={styles.timeOfDayContainer}>
                  {["Morning", "Afternoon", "Evening", "Bedtime"].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeOfDayButton, newMedTimeOfDay.includes(time) && styles.timeOfDayButtonActive]}
                      onPress={() => toggleTimeOfDay(time)}
                    >
                      <Text style={newMedTimeOfDay.includes(time) ? styles.timeOfDayTextActive : styles.timeOfDayText}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Input
                  label="Notes (Optional)"
                  placeholder="Add any special instructions"
                  value={newMedNotes}
                  onChangeText={setNewMedNotes}
                  multiline
                  leftIcon={<Icon name="file-text" type="feather" size={24} color="#888" />}
                />

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    type="outline"
                    onPress={() => {
                      resetMedicationForm()
                      setShowAddMedication(false)
                    }}
                    containerStyle={styles.buttonHalf}
                  />
                  <Button title="Add Medication" onPress={addMedication} containerStyle={styles.buttonHalf} />
                </View>
              </Card>
            )}

            {medications.length > 0 ? (
              medications.map((medication) => (
                <Card key={medication.id} containerStyle={styles.medicationCard}>
                  <View style={styles.medicationHeader}>
                    <View style={styles.medicationTitleContainer}>
                      <Icon name="pill" type="material-community" size={24} color={colors.medication} />
                      <Text style={styles.medicationTitle}>{medication.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteMedication(medication.id)}>
                      <Icon name="trash-2" type="feather" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.medicationDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="eyedropper" type="material-community" size={16} color="#888" />
                      <Text style={styles.detailText}>Dosage: {medication.dosage}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Icon name="repeat" type="feather" size={16} color="#888" />
                      <Text style={styles.detailText}>Frequency: {medication.frequency}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Icon name="clock" type="feather" size={16} color="#888" />
                      <Text style={styles.detailText}>Time of Day: {medication.timeOfDay.join(", ")}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Icon name="calendar" type="feather" size={16} color="#888" />
                      <Text style={styles.detailText}>
                        Started: {format(new Date(medication.startDate), "MMM d, yyyy")}
                      </Text>
                    </View>

                    {medication.notes && (
                      <View style={styles.detailItem}>
                        <Icon name="file-text" type="feather" size={16} color="#888" />
                        <Text style={styles.detailText}>Notes: {medication.notes}</Text>
                      </View>
                    )}
                  </View>

                  <Button title="Edit Medication" type="outline" buttonStyle={styles.editButton} />
                </Card>
              ))
            ) : (
              <Card containerStyle={styles.card}>
                <Text style={styles.noDataText}>No medications added yet</Text>
                <Button
                  title="Add Your First Medication"
                  onPress={() => setShowAddMedication(true)}
                  containerStyle={{ marginTop: 15 }}
                />
              </Card>
            )}
          </>
        ) : (
          <>
            <View style={styles.actionButtonContainer}>
              <Button
                title="Add Reminder"
                icon={<Icon name="plus" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
                onPress={() => setShowAddReminder(!showAddReminder)}
              />
            </View>

            {showAddReminder && (
              <Card containerStyle={styles.card}>
                <Card.Title>Add New Reminder</Card.Title>
                <Card.Divider />

                <Input
                  label="Reminder Title"
                  placeholder="Enter reminder title"
                  value={newReminderTitle}
                  onChangeText={setNewReminderTitle}
                  leftIcon={<Icon name="bell" type="feather" size={24} color="#4CAF50" />}
                />

                <Text style={styles.label}>Reminder Type</Text>
                <View style={styles.reminderTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.reminderTypeButton,
                      newReminderType === "medication" && styles.reminderTypeButtonActive,
                    ]}
                    onPress={() => setNewReminderType("medication")}
                  >
                    <Icon
                      name="pill"
                      type="material-community"
                      size={24}
                      color={newReminderType === "medication" ? "#fff" : colors.medication}
                    />
                    <Text
                      style={newReminderType === "medication" ? styles.reminderTypeTextActive : styles.reminderTypeText}
                    >
                      Medication
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reminderTypeButton,
                      newReminderType === "checkup" && styles.reminderTypeButtonActive,
                    ]}
                    onPress={() => setNewReminderType("checkup")}
                  >
                    <Icon
                      name="stethoscope"
                      type="material-community"
                      size={24}
                      color={newReminderType === "checkup" ? "#fff" : "#5C6BC0"}
                    />
                    <Text
                      style={newReminderType === "checkup" ? styles.reminderTypeTextActive : styles.reminderTypeText}
                    >
                      Checkup
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reminderTypeButton,
                      newReminderType === "bloodSugar" && styles.reminderTypeButtonActive,
                    ]}
                    onPress={() => setNewReminderType("bloodSugar")}
                  >
                    <Icon
                      name="droplet"
                      type="feather"
                      size={24}
                      color={newReminderType === "bloodSugar" ? "#fff" : colors.bloodSugar}
                    />
                    <Text
                      style={newReminderType === "bloodSugar" ? styles.reminderTypeTextActive : styles.reminderTypeText}
                    >
                      Blood Sugar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.reminderTypeButton, newReminderType === "custom" && styles.reminderTypeButtonActive]}
                    onPress={() => setNewReminderType("custom")}
                  >
                    <Icon
                      name="bell"
                      type="feather"
                      size={24}
                      color={newReminderType === "custom" ? "#fff" : "#4CAF50"}
                    />
                    <Text
                      style={newReminderType === "custom" ? styles.reminderTypeTextActive : styles.reminderTypeText}
                    >
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Description (Optional)"
                  placeholder="Add additional details"
                  value={newReminderDesc}
                  onChangeText={setNewReminderDesc}
                  multiline
                  leftIcon={<Icon name="file-text" type="feather" size={24} color="#888" />}
                />

                <Input
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={newReminderDate}
                  onChangeText={setNewReminderDate}
                  leftIcon={<Icon name="calendar" type="feather" size={24} color="#888" />}
                />

                <Input
                  label="Time"
                  placeholder="HH:MM"
                  value={newReminderTime}
                  onChangeText={setNewReminderTime}
                  leftIcon={<Icon name="clock" type="feather" size={24} color="#888" />}
                />

                <View style={styles.recurringContainer}>
                  <Text style={styles.label}>Recurring Reminder</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setNewReminderRecurring(!newReminderRecurring)}
                  >
                    <View style={[styles.toggleTrack, newReminderRecurring && styles.toggleTrackActive]}>
                      <View style={[styles.toggleThumb, newReminderRecurring && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>
                </View>

                {newReminderRecurring && (
                  <>
                    <Text style={styles.label}>Recurrence Pattern</Text>
                    <View style={styles.patternContainer}>
                      {["daily", "weekly", "monthly"].map((pattern) => (
                        <TouchableOpacity
                          key={pattern}
                          style={[styles.patternButton, newReminderPattern === pattern && styles.patternButtonActive]}
                          onPress={() => setNewReminderPattern(pattern)}
                        >
                          <Text style={newReminderPattern === pattern ? styles.patternTextActive : styles.patternText}>
                            {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    type="outline"
                    onPress={() => {
                      resetReminderForm()
                      setShowAddReminder(false)
                    }}
                    containerStyle={styles.buttonHalf}
                  />
                  <Button title="Add Reminder" onPress={addReminder} containerStyle={styles.buttonHalf} />
                </View>
              </Card>
            )}

            <Card containerStyle={styles.card}>
              <Card.Title>Upcoming Reminders</Card.Title>
              <Card.Divider />

              {getUpcomingReminders().length > 0 ? (
                getUpcomingReminders().map((reminder) => (
                  <View key={reminder.id}>
                    <View style={styles.reminderItem}>
                      <View style={styles.reminderIconContainer}>{getReminderIcon(reminder.type)}</View>
                      <View style={styles.reminderContent}>
                        <Text style={styles.reminderTitle}>{reminder.title}</Text>
                        {reminder.description && <Text style={styles.reminderDescription}>{reminder.description}</Text>}
                        <Text style={styles.reminderDate}>
                          {format(new Date(reminder.date), "EEE, MMM d, yyyy")} at{" "}
                          {format(new Date(reminder.date), "h:mm a")}
                        </Text>
                        {reminder.recurring && (
                          <Text style={styles.reminderRecurring}>Repeats {reminder.recurrencePattern}</Text>
                        )}
                      </View>
                      <View style={styles.reminderActions}>
                        <TouchableOpacity onPress={() => markReminderComplete(reminder.id)}>
                          <Icon name="check-circle" type="feather" size={24} color={colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteReminder(reminder.id)}>
                          <Icon name="trash-2" type="feather" size={24} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No upcoming reminders</Text>
              )}
            </Card>
          </>
        )}
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  activeTabButton: {
    backgroundColor: colors.medication,
  },
  tabText: {
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  actionButtonContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
  },
  medicationCard: {
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: colors.medication,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  medicationTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  medicationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  medicationDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 10,
    color: "#666",
  },
  editButton: {
    borderColor: colors.medication,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#86939e",
    marginLeft: 10,
    marginBottom: 5,
  },
  timeOfDayContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  timeOfDayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  timeOfDayButtonActive: {
    backgroundColor: colors.medication,
    borderColor: colors.medication,
  },
  timeOfDayText: {
    color: "#666",
  },
  timeOfDayTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  reminderTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  reminderTypeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    marginHorizontal: 3,
    marginBottom: 10,
  },
  reminderTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reminderTypeText: {
    color: "#666",
    marginTop: 5,
    fontSize: 12,
  },
  reminderTypeTextActive: {
    color: "#fff",
    marginTop: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  recurringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  toggleButton: {
    padding: 5,
  },
  toggleTrack: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: colors.success,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  toggleThumbActive: {
    transform: [{ translateX: 26 }],
  },
  patternContainer: {
    flexDirection: "row",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  patternButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    marginHorizontal: 3,
    alignItems: "center",
  },
  patternButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  patternText: {
    color: "#666",
  },
  patternTextActive: {
    color: "#fff",
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
  reminderItem: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  reminderIconContainer: {
    marginRight: 10,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reminderDescription: {
    color: "#666",
  },
  reminderDate: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },
  reminderRecurring: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 3,
  },
  reminderActions: {
    flexDirection: "row",
    width: 70,
    justifyContent: "space-between",
  },
  divider: {
    marginVertical: 5,
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
  },
})

