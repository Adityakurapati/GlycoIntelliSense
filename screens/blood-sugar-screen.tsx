"use client"

import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, Image, Modal } from "react-native"
import { Text, Card, Button, Input, Icon, Divider } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { format } from "date-fns"
import * as ImagePicker from "expo-image-picker"

import type { BloodSugarReading } from "../types"
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

export default function BloodSugarScreen() {
        const [bloodSugarData, setBloodSugarData] = useState<BloodSugarReading[]>([])
        const [newReading, setNewReading] = useState("")
        const [mealStatus, setMealStatus] = useState<"before" | "after" | "fasting">("fasting")
        const [notes, setNotes] = useState("")
        const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly">("daily")
        const [loading, setLoading] = useState(true)

        // New state variables for image functionality
        const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null)
        const [modalVisible, setModalVisible] = useState(false)
        const [selectedReading, setSelectedReading] = useState<BloodSugarReading | null>(null)

        useEffect(() => {
                // In a real app, fetch data from API or local storage
                setBloodSugarData(mockBloodSugarReadings)
                setLoading(false)
        }, [])

        const pickImage = async () => {
                // Request permissions for accessing the image library
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

                if (status !== 'granted') {
                        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload prescription images!')
                        return
                }

                // Launch the image library
                const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                })

                if (!result.canceled && result.assets && result.assets.length > 0) {
                        setPrescriptionImage(result.assets[0].uri)
                }
        }

        const addBloodSugarReading = () => {
                if (!newReading || isNaN(Number(newReading))) {
                        Alert.alert("Invalid Input", "Please enter a valid blood sugar reading")
                        return
                }

                const newReadingObj: BloodSugarReading = {
                        id: Date.now().toString(),
                        value: Number(newReading),
                        timestamp: new Date(),
                        mealStatus: mealStatus,
                        notes: notes,
                        prescriptionImageUri: prescriptionImage, // Add the image URI to the reading
                }

                setBloodSugarData([...bloodSugarData, newReadingObj])
                setNewReading("")
                setNotes("")
                setMealStatus("fasting")
                setPrescriptionImage(null) // Reset the image after adding

                Alert.alert("Success", "Blood sugar reading added successfully")
        }

        const openReadingModal = (reading: BloodSugarReading) => {
                setSelectedReading(reading)
                setModalVisible(true)
        }

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

        const getFilteredData = () => {
                const now = new Date()
                let filteredData = [...bloodSugarData]

                if (timeFrame === "daily") {
                        filteredData = filteredData.filter((reading) => {
                                const readingDate = new Date(reading.timestamp)
                                return (
                                        readingDate.getDate() === now.getDate() &&
                                        readingDate.getMonth() === now.getMonth() &&
                                        readingDate.getFullYear() === now.getFullYear()
                                )
                        })
                } else if (timeFrame === "weekly") {
                        const oneWeekAgo = new Date(now)
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                        filteredData = filteredData.filter((reading) => {
                                const readingDate = new Date(reading.timestamp)
                                return readingDate >= oneWeekAgo
                        })
                } else if (timeFrame === "monthly") {
                        const oneMonthAgo = new Date(now)
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                        filteredData = filteredData.filter((reading) => {
                                const readingDate = new Date(reading.timestamp)
                                return readingDate >= oneMonthAgo
                        })
                }

                return filteredData
        }

        const getChartData = () => {
                const filteredData = getFilteredData()

                return {
                        labels: filteredData.map((reading) => {
                                const date = new Date(reading.timestamp)
                                if (timeFrame === "daily") {
                                        return format(date, "HH:mm")
                                } else if (timeFrame === "weekly") {
                                        return format(date, "EEE")
                                } else {
                                        return format(date, "MM/dd")
                                }
                        }),
                        datasets: [
                                {
                                        data: filteredData.map((reading) => reading.value),
                                        color: () => colors.bloodSugar,
                                        strokeWidth: 2,
                                },
                        ],
                }
        }

        return (
                <SafeAreaView style={styles.container}>
                        <ScrollView>
                                <Card containerStyle={styles.card}>
                                        <Card.Title>Add Blood Sugar Reading</Card.Title>
                                        <Card.Divider />

                                        <Input
                                                label="Blood Sugar Level (mg/dL)"
                                                placeholder="Enter your reading"
                                                keyboardType="numeric"
                                                value={newReading}
                                                onChangeText={setNewReading}
                                                leftIcon={<Icon name="droplet" type="feather" size={24} color={colors.bloodSugar} />}
                                        />

                                        <Text style={styles.label}>Meal Status</Text>
                                        <View style={styles.mealStatusContainer}>
                                                <TouchableOpacity
                                                        style={[styles.mealStatusButton, mealStatus === "before" && styles.mealStatusButtonActive]}
                                                        onPress={() => setMealStatus("before")}
                                                >
                                                        <Text style={mealStatus === "before" ? styles.mealStatusTextActive : styles.mealStatusText}>
                                                                Before Meal
                                                        </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.mealStatusButton, mealStatus === "after" && styles.mealStatusButtonActive]}
                                                        onPress={() => setMealStatus("after")}
                                                >
                                                        <Text style={mealStatus === "after" ? styles.mealStatusTextActive : styles.mealStatusText}>
                                                                After Meal
                                                        </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.mealStatusButton, mealStatus === "fasting" && styles.mealStatusButtonActive]}
                                                        onPress={() => setMealStatus("fasting")}
                                                >
                                                        <Text style={mealStatus === "fasting" ? styles.mealStatusTextActive : styles.mealStatusText}>
                                                                Fasting
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>

                                        <Input
                                                label="Notes (Optional)"
                                                placeholder="Add any notes here"
                                                multiline
                                                value={notes}
                                                onChangeText={setNotes}
                                                leftIcon={<Icon name="file-text" type="feather" size={24} color="#888" />}
                                        />

                                        {/* Prescription Image Upload Section */}
                                        <Text style={styles.label}>Prescription Image</Text>
                                        <View style={styles.imageContainer}>
                                                {prescriptionImage ? (
                                                        <View style={styles.imagePreviewContainer}>
                                                                <Image source={{ uri: prescriptionImage }} style={styles.imagePreview} />
                                                                <TouchableOpacity
                                                                        style={styles.removeImageButton}
                                                                        onPress={() => setPrescriptionImage(null)}
                                                                >
                                                                        <Icon name="x-circle" type="feather" size={24} color="#ff4444" />
                                                                </TouchableOpacity>
                                                        </View>
                                                ) : (
                                                        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                                                                <Icon name="camera" type="feather" size={24} color="#888" />
                                                                <Text style={styles.uploadText}>Upload Prescription</Text>
                                                        </TouchableOpacity>
                                                )}
                                        </View>

                                        <Button
                                                title="Add Reading"
                                                icon={<Icon name="plus" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
                                                onPress={addBloodSugarReading}
                                        />
                                </Card>

                                <Card containerStyle={styles.card}>
                                        <Card.Title>Blood Sugar Trends</Card.Title>
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

                                        {getFilteredData().length > 0 ? (
                                                <LineChart
                                                        data={getChartData()}
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
                                        ) : (
                                                <Text style={styles.noDataText}>No data available for the selected time frame</Text>
                                        )}
                                </Card>

                                <Card containerStyle={styles.card}>
                                        <Card.Title>Recent Readings</Card.Title>
                                        <Card.Divider />

                                        {bloodSugarData.length > 0 ? (
                                                bloodSugarData
                                                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                        .slice(0, 5)
                                                        .map((reading, index) => (
                                                                <View key={reading.id}>
                                                                        <TouchableOpacity
                                                                                style={styles.readingItem}
                                                                                onPress={() => openReadingModal(reading)}
                                                                        >
                                                                                <View>
                                                                                        <Text style={styles.readingValue}>{reading.value} mg/dL</Text>
                                                                                        <Text style={styles.readingMealStatus}>
                                                                                                {reading.mealStatus.charAt(0).toUpperCase() + reading.mealStatus.slice(1)}
                                                                                        </Text>
                                                                                        {reading.prescriptionImageUri && (
                                                                                                <View style={styles.hasImageIndicator}>
                                                                                                        <Icon name="image" type="feather" size={12} color="#fff" />
                                                                                                        <Text style={styles.hasImageText}>Prescription</Text>
                                                                                                </View>
                                                                                        )}
                                                                                </View>
                                                                                <View>
                                                                                        <Text style={styles.readingDate}>{format(new Date(reading.timestamp), "MMM dd, yyyy")}</Text>
                                                                                        <Text style={styles.readingTime}>{format(new Date(reading.timestamp), "h:mm a")}</Text>
                                                                                </View>
                                                                        </TouchableOpacity>
                                                                        {index < bloodSugarData.length - 1 && <Divider style={styles.divider} />}
                                                                </View>
                                                        ))
                                        ) : (
                                                <Text style={styles.noDataText}>No readings available</Text>
                                        )}

                                        {bloodSugarData.length > 5 && (
                                                <Button title="View All Readings" type="outline" buttonStyle={styles.viewAllButton} />
                                        )}
                                </Card>
                        </ScrollView>

                        {/* Modal for displaying reading details with prescription image */}
                        <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={() => setModalVisible(false)}
                        >
                                <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                                <TouchableOpacity
                                                        style={styles.closeButton}
                                                        onPress={() => setModalVisible(false)}
                                                >
                                                        <Icon name="x" type="feather" size={24} color="#333" />
                                                </TouchableOpacity>

                                                {selectedReading && (
                                                        <>
                                                                <Text style={styles.modalTitle}>Blood Sugar Reading</Text>
                                                                <Text style={styles.modalValue}>{selectedReading.value} mg/dL</Text>
                                                                <Text style={styles.modalDate}>
                                                                        {format(new Date(selectedReading.timestamp), "MMMM dd, yyyy 'at' h:mm a")}
                                                                </Text>
                                                                <Text style={styles.modalMealStatus}>
                                                                        {selectedReading.mealStatus.charAt(0).toUpperCase() + selectedReading.mealStatus.slice(1)}
                                                                </Text>

                                                                {selectedReading.notes && (
                                                                        <View style={styles.modalNotesSection}>
                                                                                <Text style={styles.modalSectionTitle}>Notes:</Text>
                                                                                <Text style={styles.modalNotes}>{selectedReading.notes}</Text>
                                                                        </View>
                                                                )}

                                                                {selectedReading.prescriptionImageUri ? (
                                                                        <View style={styles.modalImageSection}>
                                                                                <Text style={styles.modalSectionTitle}>Prescription:</Text>
                                                                                <Image
                                                                                        source={{ uri: selectedReading.prescriptionImageUri }}
                                                                                        style={styles.modalImage}
                                                                                        resizeMode="contain"
                                                                                />
                                                                        </View>
                                                                ) : (
                                                                        <Text style={styles.noImageText}>No prescription image available</Text>
                                                                )}
                                                        </>
                                                )}
                                        </View>
                                </View>
                        </Modal>
                </SafeAreaView>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: "#f8f9fa",
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
                marginLeft: 10,
                marginBottom: 5,
        },
        mealStatusContainer: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 15,
                paddingHorizontal: 10,
        },
        mealStatusButton: {
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 5,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                borderRadius: 5,
                marginHorizontal: 3,
                alignItems: "center",
        },
        mealStatusButtonActive: {
                backgroundColor: colors.bloodSugar,
                borderColor: colors.bloodSugar,
        },
        mealStatusText: {
                color: "#666",
                fontSize: 12,
        },
        mealStatusTextActive: {
                color: "#fff",
                fontWeight: "bold",
                fontSize: 12,
        },
        imageContainer: {
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                padding: 10,
        },
        uploadButton: {
                borderWidth: 1,
                borderColor: "#e0e0e0",
                borderStyle: "dashed",
                borderRadius: 10,
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
        },
        uploadText: {
                color: "#888",
                marginTop: 10,
        },
        imagePreviewContainer: {
                width: "100%",
                position: "relative",
        },
        imagePreview: {
                width: "100%",
                height: 200,
                borderRadius: 10,
        },
        removeImageButton: {
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: 15,
                padding: 5,
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
                backgroundColor: colors.bloodSugar,
                borderColor: colors.bloodSugar,
        },
        timeFrameText: {
                color: "#666",
        },
        timeFrameTextActive: {
                color: "#fff",
                fontWeight: "bold",
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
        noDataText: {
                textAlign: "center",
                color: "#888",
                marginVertical: 20,
        },
        readingItem: {
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
        },
        readingValue: {
                fontSize: 18,
                fontWeight: "bold",
                color: colors.bloodSugar,
        },
        readingMealStatus: {
                color: "#666",
                fontSize: 14,
        },
        hasImageIndicator: {
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.bloodSugar,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginTop: 5,
                alignSelf: "flex-start",
        },
        hasImageText: {
                color: "#fff",
                fontSize: 10,
                marginLeft: 4,
        },
        readingDate: {
                textAlign: "right",
                fontSize: 14,
        },
        readingTime: {
                textAlign: "right",
                color: "#888",
                fontSize: 12,
        },
        divider: {
                marginVertical: 5,
        },
        viewAllButton: {
                marginTop: 10,
        },
        // Modal styles
        modalContainer: {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        modalContent: {
                width: "90%",
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                        width: 0,
                        height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                maxHeight: "80%",
        },
        closeButton: {
                position: "absolute",
                top: 15,
                right: 15,
                zIndex: 1,
        },
        modalTitle: {
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 15,
                marginTop: 5,
        },
        modalValue: {
                fontSize: 32,
                fontWeight: "bold",
                color: colors.bloodSugar,
                marginBottom: 10,
        },
        modalDate: {
                fontSize: 16,
                marginBottom: 5,
        },
        modalMealStatus: {
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 20,
        },
        modalSectionTitle: {
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
                alignSelf: "flex-start",
        },
        modalNotesSection: {
                width: "100%",
                marginBottom: 20,
        },
        modalNotes: {
                fontSize: 14,
                color: "#555",
                backgroundColor: "#f8f9fa",
                padding: 10,
                borderRadius: 5,
                width: "100%",
        },
        modalImageSection: {
                width: "100%",
                marginBottom: 20,
        },
        modalImage: {
                width: "100%",
                height: 300,
                borderRadius: 10,
        },
        noImageText: {
                color: "#888",
                marginTop: 20,
        },
})