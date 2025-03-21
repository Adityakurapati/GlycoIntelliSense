"use client"
import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native'
import { Text, ListItem, Button, Icon, Divider } from '@rneui/themed'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'

const SettingsScreen = () => {
        const [notificationsEnabled, setNotificationsEnabled] = useState(true)
        const [darkModeEnabled, setDarkModeEnabled] = useState(false)
        const [units, setUnits] = useState('mg/dL') // mg/dL or mmol/L
        const [dataSharing, setDataSharing] = useState(false)

        // Request notification permissions
        const requestNotificationPermission = async () => {
                try {
                        const { status } = await Notifications.requestPermissionsAsync()
                        if (status !== 'granted') {
                                Alert.alert(
                                        'Permission Required',
                                        'Enable notifications to receive medication and appointment reminders',
                                        [{ text: 'OK' }]
                                )
                                setNotificationsEnabled(false)
                                return
                        }
                        setNotificationsEnabled(true)
                } catch (error) {
                        console.error('Error requesting notification permission:', error)
                }
        }

        // Toggle notification settings
        const toggleNotifications = async (value) => {
                if (value) {
                        await requestNotificationPermission()
                } else {
                        setNotificationsEnabled(false)
                }

                try {
                        await AsyncStorage.setItem('@notifications_enabled', value.toString())
                } catch (error) {
                        console.error('Error saving notification settings:', error)
                }
        }

        // Toggle dark mode
        const toggleDarkMode = async (value) => {
                setDarkModeEnabled(value)
                try {
                        await AsyncStorage.setItem('@dark_mode_enabled', value.toString())
                } catch (error) {
                        console.error('Error saving dark mode settings:', error)
                }
        }

        // Switch blood glucose units
        const toggleUnits = async () => {
                const newUnits = units === 'mg/dL' ? 'mmol/L' : 'mg/dL'
                setUnits(newUnits)
                try {
                        await AsyncStorage.setItem('@glucose_units', newUnits)
                } catch (error) {
                        console.error('Error saving units settings:', error)
                }
        }

        // Toggle data sharing for research
        const toggleDataSharing = async (value) => {
                setDataSharing(value)
                try {
                        await AsyncStorage.setItem('@data_sharing_enabled', value.toString())
                } catch (error) {
                        console.error('Error saving data sharing settings:', error)
                }
        }

        // Clear app data
        const clearData = async () => {
                Alert.alert(
                        'Clear All Data',
                        'This will delete all your personal data including blood sugar readings, appointments, and preferences. This action cannot be undone.',
                        [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                        text: 'Clear All Data',
                                        style: 'destructive',
                                        onPress: async () => {
                                                try {
                                                        await AsyncStorage.clear()
                                                        Alert.alert('Success', 'All data has been cleared.')
                                                        // Reset all state variables to defaults
                                                        setNotificationsEnabled(true)
                                                        setDarkModeEnabled(false)
                                                        setUnits('mg/dL')
                                                        setDataSharing(false)
                                                } catch (error) {
                                                        console.error('Error clearing data:', error)
                                                        Alert.alert('Error', 'Failed to clear data. Please try again.')
                                                }
                                        }
                                }
                        ]
                )
        }

        // Load settings from storage on component mount
        React.useEffect(() => {
                const loadSettings = async () => {
                        try {
                                const notificationsSetting = await AsyncStorage.getItem('@notifications_enabled')
                                const darkModeSetting = await AsyncStorage.getItem('@dark_mode_enabled')
                                const unitsSetting = await AsyncStorage.getItem('@glucose_units')
                                const dataSharingSetting = await AsyncStorage.getItem('@data_sharing_enabled')

                                if (notificationsSetting !== null) setNotificationsEnabled(notificationsSetting === 'true')
                                if (darkModeSetting !== null) setDarkModeEnabled(darkModeSetting === 'true')
                                if (unitsSetting !== null) setUnits(unitsSetting)
                                if (dataSharingSetting !== null) setDataSharing(dataSharingSetting === 'true')
                        } catch (error) {
                                console.error('Error loading settings:', error)
                        }
                }

                loadSettings()
        }, [])

        return (
                <ScrollView style={styles.container}>
                        <Text h4 style={styles.sectionTitle}>App Settings</Text>

                        <ListItem bottomDivider>
                                <Icon name="bell" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>Notifications</ListItem.Title>
                                        <ListItem.Subtitle>Enable reminders for medications and appointments</ListItem.Subtitle>
                                </ListItem.Content>
                                <Switch
                                        value={notificationsEnabled}
                                        onValueChange={toggleNotifications}
                                />
                        </ListItem>

                        <ListItem bottomDivider>
                                <Icon name="moon" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>Dark Mode</ListItem.Title>
                                        <ListItem.Subtitle>Use dark theme for the app</ListItem.Subtitle>
                                </ListItem.Content>
                                <Switch
                                        value={darkModeEnabled}
                                        onValueChange={toggleDarkMode}
                                />
                        </ListItem>

                        <ListItem bottomDivider onPress={toggleUnits}>
                                <Icon name="droplet" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>Blood Glucose Units</ListItem.Title>
                                        <ListItem.Subtitle>Current: {units}</ListItem.Subtitle>
                                </ListItem.Content>
                                <Text>{units === 'mg/dL' ? 'Tap to switch to mmol/L' : 'Tap to switch to mg/dL'}</Text>
                        </ListItem>

                        <Divider style={styles.divider} />

                        <Text h4 style={styles.sectionTitle}>Data & Privacy</Text>

                        <ListItem bottomDivider>
                                <Icon name="bar-chart-2" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>Data Sharing</ListItem.Title>
                                        <ListItem.Subtitle>Share anonymous data to improve diabetes research</ListItem.Subtitle>
                                </ListItem.Content>
                                <Switch
                                        value={dataSharing}
                                        onValueChange={toggleDataSharing}
                                />
                        </ListItem>

                        <ListItem bottomDivider onPress={() => Alert.alert('Export Data', 'Your data will be exported as a CSV file')}>
                                <Icon name="download" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>Export Data</ListItem.Title>
                                        <ListItem.Subtitle>Download your readings as CSV</ListItem.Subtitle>
                                </ListItem.Content>
                                <ListItem.Chevron />
                        </ListItem>

                        <ListItem bottomDivider onPress={() => Alert.alert('Privacy Policy', 'Navigating to privacy policy...')}>
                                <Icon name="shield" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>Privacy Policy</ListItem.Title>
                                </ListItem.Content>
                                <ListItem.Chevron />
                        </ListItem>

                        <Divider style={styles.divider} />

                        <Text h4 style={styles.sectionTitle}>Support</Text>

                        <ListItem bottomDivider onPress={() => Alert.alert('Contact Support', 'Opening support email...')}>
                                <Icon name="help-circle" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>Contact Support</ListItem.Title>
                                </ListItem.Content>
                                <ListItem.Chevron />
                        </ListItem>

                        <ListItem bottomDivider onPress={() => Alert.alert('About', 'GlycoIntelliSense v1.0.0')}>
                                <Icon name="info" type="feather" />
                                <ListItem.Content>
                                        <ListItem.Title>About</ListItem.Title>
                                        <ListItem.Subtitle>App version and information</ListItem.Subtitle>
                                </ListItem.Content>
                                <ListItem.Chevron />
                        </ListItem>

                        <View style={styles.buttonContainer}>
                                <Button
                                        title="Clear All Data"
                                        type="outline"
                                        icon={<Icon name="trash-2" type="feather" color="red" style={styles.buttonIcon} />}
                                        titleStyle={{ color: 'red' }}
                                        buttonStyle={styles.clearButton}
                                        onPress={clearData}
                                />
                        </View>
                </ScrollView>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#f5f5f5',
        },
        sectionTitle: {
                padding: 16,
                backgroundColor: '#f5f5f5',
        },
        divider: {
                marginVertical: 10,
        },
        buttonContainer: {
                padding: 16,
                marginBottom: 20,
        },
        clearButton: {
                borderColor: 'red',
                borderWidth: 1,
                marginTop: 10,
        },
        buttonIcon: {
                marginRight: 10,
        }
})

export default SettingsScreen