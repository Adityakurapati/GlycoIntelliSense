import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, Switch, Modal, TextInput } from 'react-native';
import { Text, Card, Button, Input, Icon, Divider, Tab, TabView } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebase';
import { addMedication, fetchMedications, deleteMedication, updateMedicationReminder, setupNotifications } from '../config/medicationService';
import { useAuth } from '../context/AuthContext';

// Set up notification handler
Notifications.setNotificationHandler({
        handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
        }),
});

export default function MedicationScreen() {
        const { user } = useAuth(); // Get the authenticated user
        const [medications, setMedications] = useState([]);
        const [loading, setLoading] = useState(true);
        const [tabIndex, setTabIndex] = useState(0);
        const [showAddMedication, setShowAddMedication] = useState(false);

        // New medication form state
        const [newMedName, setNewMedName] = useState('');
        const [newMedDosage, setNewMedDosage] = useState('');
        const [newMedFrequency, setNewMedFrequency] = useState('');
        const [newMedTimeOfDay, setNewMedTimeOfDay] = useState([]);
        const [newMedNotes, setNewMedNotes] = useState('');

        // Time input state
        const [timeInput, setTimeInput] = useState('');

        // Set up notifications on component mount
        useEffect(() => {
                const initializeNotifications = async () => {
                        try {
                                await setupNotifications();
                        } catch (error) {
                                console.error("Error setting up notifications:", error);
                                Alert.alert("Notification Error", "Unable to set up medication reminders. Please check your device settings.");
                        }
                };

                initializeNotifications();

                // Set up listener for foreground notifications
                const subscription = Notifications.addNotificationReceivedListener(notification => {
                        const medicationId = notification.request.content.data.medicationId;
                        // You could update the UI to highlight this medication if needed
                });

                return () => {
                        subscription.remove();
                };
        }, []);

        // Fetch medications for the authenticated user
        useEffect(() => {
                const loadMedications = async () => {
                        if (user) {
                                try {
                                        const data = await fetchMedications(user.uid);
                                        setMedications(data);
                                } catch (error) {
                                        console.error("Error loading medications: ", error);
                                        Alert.alert("Error", "Failed to load medications.");
                                } finally {
                                        setLoading(false);
                                }
                        }
                };

                loadMedications();
        }, [user]);

        // Reset the medication form
        const resetMedicationForm = () => {
                setNewMedName('');
                setNewMedDosage('');
                setNewMedFrequency('');
                setNewMedTimeOfDay([]);
                setNewMedNotes('');
                setTimeInput('');
        };

        // Add time to medication
        const addTimeToMedication = () => {
                // Basic time format validation (hh:mm AM/PM)
                const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;

                if (!timeRegex.test(timeInput)) {
                        Alert.alert("Invalid Time Format", "Please use the format 'HH:MM AM/PM' (e.g., '08:00 AM')");
                        return;
                }

                // Add time if it doesn't already exist
                if (!newMedTimeOfDay.includes(timeInput)) {
                        setNewMedTimeOfDay([...newMedTimeOfDay, timeInput]);
                        setTimeInput(''); // Clear the input field
                } else {
                        Alert.alert("Duplicate Time", "This time is already added to the medication schedule.");
                }
        };

        // Remove a time from the array
        const removeTime = (timeToRemove) => {
                setNewMedTimeOfDay(newMedTimeOfDay.filter(time => time !== timeToRemove));
        };

        // Add a new medication
        const handleAddMedication = async () => {
                if (!user) {
                        Alert.alert("Error", "You must be logged in to add a medication.");
                        return;
                }

                if (!newMedName.trim()) {
                        Alert.alert("Error", "Medication name is required.");
                        return;
                }

                if (newMedTimeOfDay.length === 0) {
                        Alert.alert("Error", "At least one reminder time is required.");
                        return;
                }

                const newMedication = {
                        name: newMedName.trim(),
                        dosage: newMedDosage.trim(),
                        frequency: newMedFrequency.trim(),
                        timeOfDay: newMedTimeOfDay,
                        notes: newMedNotes.trim(),
                        startDate: new Date().toISOString(),
                        reminder: true, // Default to enabled
                };

                try {
                        const medicationId = await addMedication(newMedication, user.uid);
                        // Medication will be updated in the next useEffect call
                        resetMedicationForm();
                        setShowAddMedication(false);
                        Alert.alert("Success", "Medication and reminders added successfully.");

                        // Refresh medications list
                        const updatedMedications = await fetchMedications(user.uid);
                        setMedications(updatedMedications);
                } catch (error) {
                        console.error("Error adding medication: ", error);
                        Alert.alert("Error", "Failed to add medication.");
                }
        };

        // Toggle medication reminder
        const handleToggleReminder = async (medication) => {
                if (!user) {
                        Alert.alert("Error", "You must be logged in to update reminders.");
                        return;
                }

                try {
                        await updateMedicationReminder(user.uid, medication.id, !medication.reminder);

                        // Update local state
                        const updatedMedications = medications.map(med =>
                                med.id === medication.id ? { ...med, reminder: !medication.reminder } : med
                        );
                        setMedications(updatedMedications);
                } catch (error) {
                        console.error("Error toggling reminder: ", error);
                        Alert.alert("Error", "Failed to update reminder.");
                }
        };

        // Delete a medication
        const handleDeleteMedication = async (medicationId) => {
                if (!user) {
                        Alert.alert("Error", "You must be logged in to delete a medication.");
                        return;
                }

                Alert.alert(
                        "Confirm Delete",
                        "Are you sure you want to delete this medication? This will also remove all reminders.",
                        [
                                { text: "Cancel", style: "cancel" },
                                {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: async () => {
                                                try {
                                                        await deleteMedication(user.uid, medicationId);
                                                        setMedications(medications.filter((med) => med.id !== medicationId));
                                                } catch (error) {
                                                        console.error("Error deleting medication: ", error);
                                                        Alert.alert("Error", "Failed to delete medication.");
                                                }
                                        }
                                }
                        ]
                );
        };

        // Render medication card
        const renderMedicationCard = (medication) => (
                <Card key={medication.id} containerStyle={styles.medicationCard}>
                        <View style={styles.medicationHeader}>
                                <Text style={styles.medicationTitle}>{medication.name}</Text>
                                <TouchableOpacity onPress={() => handleDeleteMedication(medication.id)}>
                                        <Icon name="trash-2" type="feather" size={20} color="#FF0000" />
                                </TouchableOpacity>
                        </View>
                        <Text>Dosage: {medication.dosage}</Text>
                        <Text>Frequency: {medication.frequency}</Text>
                        <Divider style={styles.divider} />
                        <Text style={styles.sectionTitle}>Reminder Times:</Text>
                        {medication.timeOfDay && medication.timeOfDay.length > 0 ? (
                                medication.timeOfDay.map((time, index) => (
                                        <Text key={index} style={styles.timeText}>{time}</Text>
                                ))
                        ) : (
                                <Text style={styles.noDataText}>No reminder times set</Text>
                        )}
                        {medication.notes && (
                                <>
                                        <Divider style={styles.divider} />
                                        <Text style={styles.sectionTitle}>Notes:</Text>
                                        <Text>{medication.notes}</Text>
                                </>
                        )}
                </Card>
        );

        // Render reminder card
        const renderReminderCard = (medication) => (
                <Card key={medication.id} containerStyle={[
                        styles.medicationCard,
                        { borderLeftColor: medication.reminder ? "#4CAF50" : "#888888" }
                ]}>
                        <View style={styles.medicationHeader}>
                                <Text style={styles.medicationTitle}>{medication.name}</Text>
                                <Switch
                                        value={medication.reminder}
                                        onValueChange={() => handleToggleReminder(medication)}
                                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                                        thumbColor={medication.reminder ? "#4CAF50" : "#f4f3f4"}
                                />
                        </View>
                        <Text>Dosage: {medication.dosage}</Text>
                        <Text style={medication.reminder ? styles.activeText : styles.inactiveText}>
                                Status: {medication.reminder ? 'Active' : 'Disabled'}
                        </Text>
                        <Divider style={styles.divider} />
                        <Text style={styles.sectionTitle}>Reminder Times:</Text>
                        {medication.timeOfDay && medication.timeOfDay.length > 0 ? (
                                medication.timeOfDay.map((time, index) => (
                                        <Text key={index} style={styles.timeText}>{time}</Text>
                                ))
                        ) : (
                                <Text style={styles.noDataText}>No reminder times set</Text>
                        )}
                </Card>
        );

        return (
                <SafeAreaView style={styles.container}>
                        <Tab
                                value={tabIndex}
                                onChange={setTabIndex}
                                indicatorStyle={styles.tabIndicator}
                                containerStyle={styles.tabContainer}
                        >
                                <Tab.Item
                                        title="Medications"
                                        titleStyle={styles.tabTitle}
                                        icon={{ name: 'pill', type: 'material-community', color: tabIndex === 0 ? '#2089dc' : 'gray' }}
                                />
                                <Tab.Item
                                        title="Reminders"
                                        titleStyle={styles.tabTitle}
                                        icon={{ name: 'bell', type: 'feather', color: tabIndex === 1 ? '#2089dc' : 'gray' }}
                                />
                        </Tab>

                        <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
                                <TabView.Item style={styles.tabContent}>
                                        <ScrollView>
                                                <Button
                                                        title="Add New Medication"
                                                        icon={{ name: 'plus', type: 'feather', color: 'white', size: 18 }}
                                                        containerStyle={styles.addButtonContainer}
                                                        onPress={() => setShowAddMedication(true)}
                                                />

                                                {medications.length === 0 ? (
                                                        <Card containerStyle={styles.card}>
                                                                <Text style={styles.noDataText}>No medications added yet.</Text>
                                                        </Card>
                                                ) : (
                                                        medications.map(renderMedicationCard)
                                                )}
                                        </ScrollView>
                                </TabView.Item>

                                <TabView.Item style={styles.tabContent}>
                                        <ScrollView>
                                                {medications.length === 0 ? (
                                                        <Card containerStyle={styles.card}>
                                                                <Text style={styles.noDataText}>No medication reminders yet.</Text>
                                                        </Card>
                                                ) : (
                                                        medications.map(renderReminderCard)
                                                )}
                                        </ScrollView>
                                </TabView.Item>
                        </TabView>

                        {/* Add Medication Modal */}
                        <Modal
                                visible={showAddMedication}
                                animationType="slide"
                                transparent={true}
                                onRequestClose={() => setShowAddMedication(false)}
                        >
                                <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                                <Text style={styles.modalTitle}>Add New Medication</Text>

                                                <Input
                                                        placeholder="Medication Name *"
                                                        value={newMedName}
                                                        onChangeText={setNewMedName}
                                                        leftIcon={{ name: 'pill', type: 'material-community' }}
                                                />

                                                <Input
                                                        placeholder="Dosage (e.g., 10mg)"
                                                        value={newMedDosage}
                                                        onChangeText={setNewMedDosage}
                                                        leftIcon={{ name: 'eyedropper', type: 'font-awesome-5' }}
                                                />

                                                <Input
                                                        placeholder="Frequency (e.g., Daily, Twice daily)"
                                                        value={newMedFrequency}
                                                        onChangeText={setNewMedFrequency}
                                                        leftIcon={{ name: 'calendar', type: 'feather' }}
                                                />

                                                <Text style={styles.sectionTitle}>Reminder Times:</Text>
                                                <View style={styles.timeContainer}>
                                                        {newMedTimeOfDay.map((time, index) => (
                                                                <View key={index} style={styles.timeTag}>
                                                                        <Text style={styles.timeTagText}>{time}</Text>
                                                                        <TouchableOpacity onPress={() => removeTime(time)}>
                                                                                <Icon name="x" type="feather" size={16} color="white" />
                                                                        </TouchableOpacity>
                                                                </View>
                                                        ))}
                                                </View>

                                                <View style={styles.timeInputContainer}>
                                                        <Input
                                                                placeholder="Add Time (e.g., 08:00 AM)"
                                                                value={timeInput}
                                                                onChangeText={setTimeInput}
                                                                leftIcon={{ name: 'clock', type: 'feather' }}
                                                                rightIcon={
                                                                        <TouchableOpacity onPress={addTimeToMedication}>
                                                                                <Icon name="plus-circle" type="feather" color="#2089dc" />
                                                                        </TouchableOpacity>
                                                                }
                                                        />
                                                        <Text style={styles.timeHelperText}>Format: HH:MM AM/PM (e.g. 08:00 AM)</Text>
                                                </View>

                                                <Input
                                                        placeholder="Notes (optional)"
                                                        value={newMedNotes}
                                                        onChangeText={setNewMedNotes}
                                                        leftIcon={{ name: 'file-text', type: 'feather' }}
                                                        multiline
                                                />

                                                <View style={styles.modalButtonContainer}>
                                                        <Button
                                                                title="Cancel"
                                                                type="outline"
                                                                containerStyle={styles.modalButton}
                                                                onPress={() => {
                                                                        resetMedicationForm();
                                                                        setShowAddMedication(false);
                                                                }}
                                                        />
                                                        <Button
                                                                title="Save"
                                                                containerStyle={styles.modalButton}
                                                                onPress={handleAddMedication}
                                                        />
                                                </View>
                                        </View>
                                </View>
                        </Modal>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: "#f8f9fa",
        },
        tabContainer: {
                backgroundColor: 'white',
                elevation: 2,
        },
        tabIndicator: {
                backgroundColor: '#2089dc',
                height: 3,
        },
        tabTitle: {
                fontSize: 12,
        },
        tabContent: {
                width: '100%',
        },
        card: {
                borderRadius: 10,
                marginBottom: 15,
        },
        medicationCard: {
                borderRadius: 10,
                marginBottom: 15,
                borderLeftWidth: 5,
                borderLeftColor: "#4CAF50",
        },
        medicationHeader: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
        },
        medicationTitle: {
                fontSize: 18,
                fontWeight: "bold",
        },
        divider: {
                marginVertical: 10,
        },
        sectionTitle: {
                fontWeight: 'bold',
                marginBottom: 5,
        },
        noDataText: {
                textAlign: 'center',
                fontSize: 16,
                color: '#888',
                marginBottom: 10,
        },
        addButtonContainer: {
                margin: 15,
        },
        timeText: {
                padding: 3,
        },
        activeText: {
                color: '#4CAF50',
                fontWeight: 'bold',
        },
        inactiveText: {
                color: '#888888',
        },
        // Modal Styles
        modalContainer: {
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
                backgroundColor: 'white',
                margin: 20,
                borderRadius: 10,
                padding: 20,
                elevation: 5,
                maxHeight: '90%',
        },
        modalTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
        },
        modalButtonContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 15,
        },
        modalButton: {
                flex: 1,
                marginHorizontal: 5,
        },
        timeContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginVertical: 10,
        },
        timeTag: {
                backgroundColor: '#2089dc',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                borderRadius: 20,
                margin: 4,
        },
        timeTagText: {
                color: 'white',
                marginRight: 5,
        },
        timeInputContainer: {
                marginBottom: 15,
        },
        timeHelperText: {
                fontSize: 12,
                color: '#888',
                marginLeft: 10,
                marginTop: -10,
        },
});