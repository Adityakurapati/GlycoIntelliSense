"use client"

import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Text, Card, Button, Input, Icon } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import { format } from "date-fns"

import type { Appointment, Lab } from "../types"
import { colors } from "../constants/theme"

// Mock data - in a real app, this would come from a database or API
const mockAppointments: Appointment[] = [
  {
    id: "1",
    labId: "lab1",
    labName: "HealthFirst Labs",
    testType: "HbA1c Test",
    date: new Date(2023, 3, 15, 10, 30),
    status: "scheduled",
    homeCollection: true,
    address: "123 Main St, Anytown, USA",
  },
  {
    id: "2",
    labId: "lab2",
    labName: "DiabetesCare Diagnostics",
    testType: "Fasting Blood Glucose",
    date: new Date(2023, 3, 5, 9, 0),
    status: "completed",
    homeCollection: false,
    results: {
      url: "https://example.com/results/123",
      date: new Date(2023, 3, 6),
    },
  },
  {
    id: "3",
    labId: "lab1",
    labName: "HealthFirst Labs",
    testType: "Lipid Profile",
    date: new Date(2023, 2, 20, 11, 15),
    status: "completed",
    homeCollection: true,
    address: "123 Main St, Anytown, USA",
    results: {
      url: "https://example.com/results/456",
      date: new Date(2023, 2, 22),
    },
  },
]

const mockLabs: Lab[] = [
  {
    id: "lab1",
    name: "HealthFirst Labs",
    address: "456 Medical Blvd, Anytown, USA",
    phone: "(555) 123-4567",
    email: "info@healthfirstlabs.com",
    services: ["HbA1c Test", "Fasting Blood Glucose", "Lipid Profile", "Kidney Function Test"],
    homeCollection: true,
    operatingHours: [
      { day: "Monday", open: "08:00", close: "18:00" },
      { day: "Tuesday", open: "08:00", close: "18:00" },
      { day: "Wednesday", open: "08:00", close: "18:00" },
      { day: "Thursday", open: "08:00", close: "18:00" },
      { day: "Friday", open: "08:00", close: "18:00" },
      { day: "Saturday", open: "09:00", close: "14:00" },
      { day: "Sunday", open: "Closed", close: "Closed" },
    ],
  },
  {
    id: "lab2",
    name: "DiabetesCare Diagnostics",
    address: "789 Health St, Anytown, USA",
    phone: "(555) 987-6543",
    email: "appointments@diabetescarediag.com",
    services: ["HbA1c Test", "Fasting Blood Glucose", "Oral Glucose Tolerance Test"],
    homeCollection: false,
    operatingHours: [
      { day: "Monday", open: "07:30", close: "19:00" },
      { day: "Tuesday", open: "07:30", close: "19:00" },
      { day: "Wednesday", open: "07:30", close: "19:00" },
      { day: "Thursday", open: "07:30", close: "19:00" },
      { day: "Friday", open: "07:30", close: "19:00" },
      { day: "Saturday", open: "08:00", close: "16:00" },
      { day: "Sunday", open: "08:00", close: "12:00" },
    ],
  },
]

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [labs, setLabs] = useState<Lab[]>([])
  const [showBooking, setShowBooking] = useState(false)
  const [selectedLab, setSelectedLab] = useState<string>("")
  const [selectedTest, setSelectedTest] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [homeCollection, setHomeCollection] = useState<boolean>(false)
  const [address, setAddress] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch data from API or local storage
    setAppointments(mockAppointments)
    setLabs(mockLabs)
    setLoading(false)
  }, [])

  const bookAppointment = () => {
    if (!selectedLab || !selectedTest || !selectedDate || !selectedTime) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    if (homeCollection && !address) {
      Alert.alert("Missing Address", "Please provide an address for home collection")
      return
    }

    const selectedLabObj = labs.find((lab) => lab.id === selectedLab)

    if (!selectedLabObj) {
      Alert.alert("Error", "Selected lab not found")
      return
    }

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const appointmentDate = new Date(selectedDate)
    appointmentDate.setHours(hours, minutes)

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      labId: selectedLab,
      labName: selectedLabObj.name,
      testType: selectedTest,
      date: appointmentDate,
      status: "scheduled",
      homeCollection,
      address: homeCollection ? address : undefined,
    }

    setAppointments([...appointments, newAppointment])
    resetForm()
    setShowBooking(false)

    Alert.alert("Success", "Appointment booked successfully")
  }

  const resetForm = () => {
    setSelectedLab("")
    setSelectedTest("")
    setSelectedDate("")
    setSelectedTime("")
    setHomeCollection(false)
    setAddress("")
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments
      .filter((appointment) => new Date(appointment.date) >= now && appointment.status === "scheduled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getPastAppointments = () => {
    const now = new Date()
    return appointments
      .filter(
        (appointment) =>
          new Date(appointment.date) < now || appointment.status === "completed" || appointment.status === "cancelled",
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const cancelAppointment = (id: string) => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          const updatedAppointments = appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, status: "cancelled" } : appointment,
          )
          setAppointments(updatedAppointments)
          Alert.alert("Success", "Appointment cancelled successfully")
        },
      },
    ])
  }

  const renderAppointmentItem = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date)

    return (
      <Card key={appointment.id} containerStyle={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentTitleContainer}>
            <Icon
              name={appointment.homeCollection ? "home" : "hospital-building"}
              type="material-community"
              size={24}
              color={colors.appointment}
            />
            <Text style={styles.appointmentTitle}>{appointment.testType}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  appointment.status === "scheduled"
                    ? colors.info
                    : appointment.status === "completed"
                      ? colors.success
                      : colors.error,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailItem}>
            <Icon name="hospital" type="font-awesome" size={16} color="#888" />
            <Text style={styles.detailText}>{appointment.labName}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="calendar" type="feather" size={16} color="#888" />
            <Text style={styles.detailText}>{format(appointmentDate, "EEEE, MMMM d, yyyy")}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="clock" type="feather" size={16} color="#888" />
            <Text style={styles.detailText}>{format(appointmentDate, "h:mm a")}</Text>
          </View>

          {appointment.homeCollection && (
            <View style={styles.detailItem}>
              <Icon name="home" type="feather" size={16} color="#888" />
              <Text style={styles.detailText}>Home Collection</Text>
            </View>
          )}

          {appointment.address && (
            <View style={styles.detailItem}>
              <Icon name="map-pin" type="feather" size={16} color="#888" />
              <Text style={styles.detailText}>{appointment.address}</Text>
            </View>
          )}

          {appointment.results && (
            <View style={styles.detailItem}>
              <Icon name="file-text" type="feather" size={16} color="#888" />
              <Text style={styles.detailText}>
                Results available since {format(new Date(appointment.results.date), "MMM d, yyyy")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.appointmentActions}>
          {appointment.status === "scheduled" && (
            <Button
              title="Cancel"
              type="outline"
              buttonStyle={styles.cancelButton}
              titleStyle={{ color: colors.error }}
              onPress={() => cancelAppointment(appointment.id)}
            />
          )}

          {appointment.results && <Button title="View Results" buttonStyle={styles.resultsButton} />}

          {appointment.status === "scheduled" && (
            <Button title="Reschedule" type="outline" buttonStyle={styles.rescheduleButton} />
          )}
        </View>
      </Card>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Test Appointments</Text>
          <Button
            title="Book Test"
            icon={<Icon name="plus" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
            onPress={() => setShowBooking(!showBooking)}
          />
        </View>

        {showBooking && (
          <Card containerStyle={styles.card}>
            <Card.Title>Book a New Test</Card.Title>
            <Card.Divider />

            <Text style={styles.label}>Select Lab</Text>
            {labs.map((lab) => (
              <TouchableOpacity
                key={lab.id}
                style={[styles.selectionItem, selectedLab === lab.id && styles.selectionItemActive]}
                onPress={() => setSelectedLab(lab.id)}
              >
                <Text style={selectedLab === lab.id ? styles.selectionTextActive : styles.selectionText}>
                  {lab.name}
                </Text>
                {lab.homeCollection && <Text style={styles.homeCollectionBadge}>Home Collection Available</Text>}
              </TouchableOpacity>
            ))}

            {selectedLab && (
              <>
                <Text style={styles.label}>Select Test Type</Text>
                {labs
                  .find((lab) => lab.id === selectedLab)
                  ?.services.map((service, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.selectionItem, selectedTest === service && styles.selectionItemActive]}
                      onPress={() => setSelectedTest(service)}
                    >
                      <Text style={selectedTest === service ? styles.selectionTextActive : styles.selectionText}>
                        {service}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </>
            )}

            {selectedTest && (
              <>
                <Input
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  leftIcon={<Icon name="calendar" type="feather" size={24} color="#888" />}
                />

                <Input
                  label="Time"
                  placeholder="HH:MM"
                  value={selectedTime}
                  onChangeText={setSelectedTime}
                  leftIcon={<Icon name="clock" type="feather" size={24} color="#888" />}
                />

                {labs.find((lab) => lab.id === selectedLab)?.homeCollection && (
                  <>
                    <View style={styles.homeCollectionContainer}>
                      <Text style={styles.label}>Home Collection</Text>
                      <TouchableOpacity style={styles.toggleButton} onPress={() => setHomeCollection(!homeCollection)}>
                        <View style={[styles.toggleTrack, homeCollection && styles.toggleTrackActive]}>
                          <View style={[styles.toggleThumb, homeCollection && styles.toggleThumbActive]} />
                        </View>
                      </TouchableOpacity>
                    </View>

                    {homeCollection && (
                      <Input
                        label="Address"
                        placeholder="Enter your address for home collection"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        leftIcon={<Icon name="map-pin" type="feather" size={24} color="#888" />}
                      />
                    )}
                  </>
                )}
              </>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                type="outline"
                onPress={() => {
                  resetForm()
                  setShowBooking(false)
                }}
                containerStyle={styles.buttonHalf}
              />
              <Button title="Book Appointment" onPress={bookAppointment} containerStyle={styles.buttonHalf} />
            </View>
          </Card>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "upcoming" && styles.activeTabButton]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={activeTab === "upcoming" ? styles.activeTabText : styles.tabText}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "past" && styles.activeTabButton]}
            onPress={() => setActiveTab("past")}
          >
            <Text style={activeTab === "past" ? styles.activeTabText : styles.tabText}>Past</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "upcoming" ? (
          getUpcomingAppointments().length > 0 ? (
            getUpcomingAppointments().map((appointment) => renderAppointmentItem(appointment))
          ) : (
            <Card containerStyle={styles.card}>
              <Text style={styles.noDataText}>No upcoming appointments</Text>
              <Button title="Book a Test" onPress={() => setShowBooking(true)} containerStyle={{ marginTop: 15 }} />
            </Card>
          )
        ) : getPastAppointments().length > 0 ? (
          getPastAppointments().map((appointment) => renderAppointmentItem(appointment))
        ) : (
          <Card containerStyle={styles.card}>
            <Text style={styles.noDataText}>No past appointments</Text>
          </Card>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
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
    marginTop: 10,
    marginBottom: 5,
  },
  selectionItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
  },
  selectionItemActive: {
    borderColor: colors.appointment,
    backgroundColor: "#fff1f0",
  },
  selectionText: {
    color: "#666",
  },
  selectionTextActive: {
    color: colors.appointment,
    fontWeight: "bold",
  },
  homeCollectionBadge: {
    fontSize: 12,
    color: colors.success,
    marginTop: 5,
  },
  homeCollectionContainer: {
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 5,
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
    backgroundColor: colors.appointment,
  },
  tabText: {
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  appointmentCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  appointmentTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  appointmentDetails: {
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
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    borderColor: colors.error,
  },
  rescheduleButton: {
    borderColor: colors.info,
  },
  resultsButton: {
    backgroundColor: colors.success,
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
  },
})

