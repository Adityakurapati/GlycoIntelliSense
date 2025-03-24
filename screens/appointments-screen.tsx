"use client"

import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from "react-native"
import { Text, Card, Button, Input, Icon, FAB } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import { format } from "date-fns"

import type { Appointment, Lab } from "../types"
import { colors } from "../constants/theme"
import {
        fetchAppointments,
        fetchLabs,
        bookNewAppointment,
        cancelUserAppointment,
        fetchLabUsers
} from "../config/appointService"
import { useAuth } from "../context/AuthContext"

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

        // Admin panel state
        const [showAdminPanel, setShowAdminPanel] = useState(false)
        const [showAdminAuth, setShowAdminAuth] = useState(false)
        const [adminUsername, setAdminUsername] = useState("")
        const [adminPassword, setAdminPassword] = useState("")
        const [labUsers, setLabUsers] = useState<any[]>([])
        const [isAuthenticated, setIsAuthenticated] = useState(false)

        useEffect(() => {
                // Fetch data from Firebase
                const loadData = async () => {
                        try {
                                const appointmentsData = await fetchAppointments()
                                const labsData = await fetchLabs()

                                setAppointments(appointmentsData)
                                setLabs(labsData)
                        } catch (error) {
                                console.error("Error loading data:", error)
                                Alert.alert("Error", "Failed to load appointments and labs")
                        } finally {
                                setLoading(false)
                        }
                }

                loadData()
        }, [])

        const bookAppointment = async () => {
                console.log("Book Appointment function triggered");

                if (!selectedLab || !selectedTest || !selectedDate || !selectedTime) {
                        Alert.alert("Missing Information", "Please fill in all required fields");
                        return;
                }

                if (homeCollection && !address) {
                        Alert.alert("Missing Address", "Please provide an address for home collection");
                        return;
                }

                console.log("Lab and test selected, proceeding...");


                const selectedLabObj = labs.find((lab) => lab.id === selectedLab);
                if (!selectedLabObj) {

                        console.log("Reached Here ");
                        Alert.alert("Error", "Selected lab not found");
                        return;
                }



                const [hours, minutes] = selectedTime.split(":").map(Number);
                const appointmentDate = new Date(selectedDate);
                appointmentDate.setHours(hours, minutes);

                const newAppointment = {
                        id: Date.now().toString(),
                        userId: "eQJzIMI711O722398z5ZFg8OPOl2",
                        labId: selectedLab,
                        labName: selectedLabObj.name,
                        testType: selectedTest,
                        date: appointmentDate.toISOString(),
                        status: "scheduled",
                        homeCollection,
                        address: homeCollection ? address : "",
                };

                console.log("New appointment object:", newAppointment);

                try {
                        setLoading(true);
                        await bookNewAppointment(newAppointment, "eQJzIMI711O722398z5ZFg8OPOl2");
                        console.log("Appointment booked successfully!");

                        setAppointments([...appointments, newAppointment]);
                        resetForm();
                        setShowBooking(false);

                        Alert.alert("Success", "Appointment booked successfully");
                } catch (error) {
                        console.error("Error booking appointment:", error);
                        Alert.alert("Error", "Failed to book appointment. Please try again.");
                } finally {
                        setLoading(false);
                }
        };



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

        const cancelAppointment = async (id: string) => {
                Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
                        {
                                text: "No",
                                style: "cancel",
                        },
                        {
                                text: "Yes",
                                onPress: async () => {
                                        try {
                                                setLoading(true)
                                                // Update in Firebase
                                                await cancelUserAppointment(id)

                                                // Update local state
                                                const updatedAppointments = appointments.map((appointment) =>
                                                        appointment.id === id ? { ...appointment, status: "cancelled" } : appointment,
                                                )
                                                setAppointments(updatedAppointments)
                                                Alert.alert("Success", "Appointment cancelled successfully")
                                        } catch (error) {
                                                console.error("Error cancelling appointment:", error)
                                                Alert.alert("Error", "Failed to cancel appointment. Please try again.")
                                        } finally {
                                                setLoading(false)
                                        }
                                },
                        },
                ])
        }

        const handleAdminAuth = async () => {
                // Simple authentication for demo purposes
                if (adminUsername === 'admin' && adminPassword === 'admin') {
                        setIsAuthenticated(true)
                        setShowAdminAuth(false)
                        setShowAdminPanel(true)

                        try {
                                // Fetch lab users when authenticated
                                const users = await fetchLabUsers()
                                setLabUsers(users)
                        } catch (error) {
                                console.error("Error fetching lab users:", error)
                                Alert.alert("Error", "Failed to load lab users")
                        }
                } else {
                        Alert.alert("Authentication Failed", "Invalid username or password")
                }
        }

        const openAdminPanel = () => {
                setAdminUsername("")
                setAdminPassword("")
                setIsAuthenticated(false)
                setShowAdminAuth(true)
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
                                                        <Button
                                                                title="Book Appointment"
                                                                onPress={bookAppointment}
                                                                containerStyle={styles.buttonHalf}
                                                                loading={loading}
                                                        />
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

                                {loading && !showBooking ? (
                                        <Card containerStyle={styles.card}>
                                                <Text style={styles.noDataText}>Loading appointments...</Text>
                                        </Card>
                                ) : activeTab === "upcoming" ? (
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

                        {/* Admin authentication modal */}
                        <Modal
                                visible={showAdminAuth}
                                transparent={true}
                                animationType="slide"
                                onRequestClose={() => setShowAdminAuth(false)}
                        >
                                <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                                <Text style={styles.modalTitle}>Admin Authentication</Text>

                                                <Input
                                                        placeholder="Username"
                                                        value={adminUsername}
                                                        onChangeText={setAdminUsername}
                                                        leftIcon={<Icon name="user" type="feather" size={24} color="#888" />}
                                                />

                                                <Input
                                                        placeholder="Password"
                                                        value={adminPassword}
                                                        onChangeText={setAdminPassword}
                                                        secureTextEntry
                                                        leftIcon={<Icon name="lock" type="feather" size={24} color="#888" />}
                                                />

                                                <View style={styles.modalButtons}>
                                                        <Button
                                                                title="Cancel"
                                                                type="outline"
                                                                onPress={() => setShowAdminAuth(false)}
                                                                containerStyle={styles.buttonHalf}
                                                        />
                                                        <Button
                                                                title="Login"
                                                                onPress={handleAdminAuth}
                                                                containerStyle={styles.buttonHalf}
                                                        />
                                                </View>
                                        </View>
                                </View>
                        </Modal>

                        {/* Admin panel modal */}
                        <Modal
                                visible={showAdminPanel}
                                transparent={true}
                                animationType="slide"
                                onRequestClose={() => setShowAdminPanel(false)}
                        >
                                <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                        <Text style={styles.modalTitle}>Lab Admin Panel</Text>
                                                        <TouchableOpacity onPress={() => setShowAdminPanel(false)}>
                                                                <Icon name="x" type="feather" size={24} />
                                                        </TouchableOpacity>
                                                </View>

                                                <Text style={styles.sectionTitle}>Enrolled Users</Text>

                                                <ScrollView style={styles.userList}>
                                                        {labUsers.length > 0 ? (
                                                                labUsers.map((user, index) => (
                                                                        <View key={index} style={styles.userItem}>
                                                                                <Icon name="user" type="feather" size={20} color="#666" />
                                                                                <View style={styles.userInfo}>
                                                                                        <Text style={styles.userName}>{user.name}</Text>
                                                                                </View>
                                                                        </View>
                                                                ))
                                                        ) : (
                                                                <Text style={styles.noDataText}>No users enrolled in this lab</Text>
                                                        )}
                                                </ScrollView>
                                        </View>
                                </View>
                        </Modal>

                        {/* Admin FAB */}
                        <FAB
                                placement="right"
                                color={colors.appointment}
                                icon={{ name: 'lab-flask', type: 'entypo', color: 'white' }}
                                onPress={openAdminPanel}
                        />
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
        // Admin Modal Styles
        modalContainer: {
                flex: 1,
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 20,
        },
        modalContent: {
                backgroundColor: "white",
                borderRadius: 10,
                padding: 20,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                maxHeight: "80%",
        },
        modalTitle: {
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 15,
                color: colors.appointment,
        },
        modalButtons: {
                flexDirection: "row",
                justifyContent: "space-between",
        },
        modalHeader: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
        },
        sectionTitle: {
                fontSize: 16,
                fontWeight: "bold",
                marginVertical: 10,
        },
        userList: {
                maxHeight: 400,
        },
        userItem: {
                flexDirection: "row",
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                alignItems: "center",
        },
        userInfo: {
                marginLeft: 10,
                flex: 1,
        },
        userName: {
                fontSize: 16,
                fontWeight: "500",
        },
        userDetails: {
                fontSize: 12,
                color: "#666",
        },
})