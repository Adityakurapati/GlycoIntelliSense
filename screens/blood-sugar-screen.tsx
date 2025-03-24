"use client"

import { useState, useEffect } from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, Image, Modal, Platform, Share } from "react-native"
import { Text, Card, Button, Input, Icon, Divider } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { format, parse, isValid, subWeeks, subMonths, subYears, startOfYear } from "date-fns"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { useAuth } from "../context/AuthContext" // Assuming you have an auth context
import {
        getBloodSugarReadings,
        addBloodSugarReading,
        updateBloodSugarReading,
        deleteBloodSugarReading,
        getPrescriptionImage
} from "../config/dbService"

import type { BloodSugarReading } from "../types"
import { colors } from "../constants/theme"

export default function BloodSugarScreen() {
        // Auth state
        const { user } = useAuth();

        // App state
        const [bloodSugarData, setBloodSugarData] = useState<BloodSugarReading[]>([])
        const [newReading, setNewReading] = useState("")
        const [mealStatus, setMealStatus] = useState<"before" | "after" | "fasting">("fasting")
        const [notes, setNotes] = useState("")
        const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly" | "yearly">("weekly")
        const [loading, setLoading] = useState(true)
        const [isRefreshing, setIsRefreshing] = useState(false)
        const [downloadLoading, setDownloadLoading] = useState(false)

        // Date and time input state
        const [dateInput, setDateInput] = useState("")
        const [timeInput, setTimeInput] = useState("")
        const [dateError, setDateError] = useState("")
        const [timeError, setTimeError] = useState("")
        const [useCurrentDateTime, setUseCurrentDateTime] = useState(true)

        // Image functionality state
        const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null)
        const [modalVisible, setModalVisible] = useState(false)
        const [selectedReading, setSelectedReading] = useState<BloodSugarReading | null>(null)

        // Initialize date and time inputs with current date/time
        useEffect(() => {
                const now = new Date();
                setDateInput(format(now, "MM/dd/yyyy"));
                setTimeInput(format(now, "hh:mm a"));
        }, []);

        // Load data on component mount and when user changes
        useEffect(() => {
                if (user) {
                        fetchBloodSugarReadings();
                }
        }, [user]);

        // Fetch blood sugar readings from Firebase
        const fetchBloodSugarReadings = async () => {
                try {
                        setLoading(true);
                        const readings = await getBloodSugarReadings(user.uid);
                        setBloodSugarData(readings);
                } catch (error) {
                        console.error("Error fetching readings:", error);
                        Alert.alert("Error", "Failed to load blood sugar readings");
                } finally {
                        setLoading(false);
                        setIsRefreshing(false);
                }
        };

        // Refresh data
        const handleRefresh = () => {
                setIsRefreshing(true);
                fetchBloodSugarReadings();
        };

        // Date and time validation handlers
        const validateDate = (date: string): boolean => {
                // Check format MM/DD/YYYY
                const parsedDate = parse(date, "MM/dd/yyyy", new Date());
                if (!isValid(parsedDate)) {
                        setDateError("Please enter a valid date (MM/DD/YYYY)");
                        return false;
                }

                // Check if date is in the future
                if (parsedDate > new Date()) {
                        setDateError("Date cannot be in the future");
                        return false;
                }

                setDateError("");
                return true;
        }

        const validateTime = (time: string): boolean => {
                // Check format hh:mm AM/PM
                const parsedTime = parse(time, "hh:mm a", new Date());
                if (!isValid(parsedTime)) {
                        setTimeError("Please enter a valid time (hh:mm AM/PM)");
                        return false;
                }

                setTimeError("");
                return true;
        }

        const handleDateChange = (text: string) => {
                setDateInput(text);
                if (!useCurrentDateTime) {
                        validateDate(text);
                }
        }

        const handleTimeChange = (text: string) => {
                setTimeInput(text);
                if (!useCurrentDateTime) {
                        validateTime(text);
                }
        }

        const toggleUseCurrentDateTime = () => {
                setUseCurrentDateTime(!useCurrentDateTime);
                if (!useCurrentDateTime) {
                        // If switching to current date/time, update the values and clear errors
                        const now = new Date();
                        setDateInput(format(now, "MM/dd/yyyy"));
                        setTimeInput(format(now, "hh:mm a"));
                        setDateError("");
                        setTimeError("");
                }
        };

        // Get combined timestamp from input date and time
        const getCombinedTimestamp = (): number => {
                if (useCurrentDateTime) {
                        return Date.now();
                }

                // Combine date and time inputs
                const dateStr = dateInput;
                const timeStr = timeInput;

                // Parse the combined date/time
                const combinedDateTimeStr = `${dateStr} ${timeStr}`;
                const parsedDateTime = parse(combinedDateTimeStr, "MM/dd/yyyy hh:mm a", new Date());

                if (!isValid(parsedDateTime)) {
                        // If invalid, fall back to current time
                        return Date.now();
                }

                return parsedDateTime.getTime();
        };

        const pickImage = async () => {
                // Request permissions for accessing the image library
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (status !== 'granted') {
                        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload prescription images!');
                        return;
                }

                // Launch the image library
                const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                });

                if (!result.canceled && result.assets && result.assets.length > 0) {
                        setPrescriptionImage(result.assets[0].uri);
                }
        };

        const addReading = async () => {
                if (!newReading || isNaN(Number(newReading))) {
                        Alert.alert("Invalid Input", "Please enter a valid blood sugar reading");
                        return;
                }

                // Validate date and time if not using current
                if (!useCurrentDateTime) {
                        const isDateValid = validateDate(dateInput);
                        const isTimeValid = validateTime(timeInput);

                        if (!isDateValid || !isTimeValid) {
                                return;
                        }
                }

                try {
                        setLoading(true);

                        const readingData = {
                                value: Number(newReading),
                                mealStatus: mealStatus,
                                notes: notes,
                                timestamp: getCombinedTimestamp()
                        };

                        await addBloodSugarReading(user.uid, readingData, prescriptionImage);

                        // Reset form
                        setNewReading("");
                        setNotes("");
                        setMealStatus("fasting");
                        setPrescriptionImage(null);

                        // Refresh data
                        await fetchBloodSugarReadings();

                        Alert.alert("Success", "Blood sugar reading added successfully");
                } catch (error) {
                        console.error("Error adding reading:", error);
                        Alert.alert("Error", "Failed to add blood sugar reading");
                } finally {
                        setLoading(false);
                }
        };

        const deleteReading = async (readingId, prescriptionImageUrl) => {
                try {
                        setLoading(true);
                        await deleteBloodSugarReading(readingId, prescriptionImageUrl);

                        // Close modal if open
                        if (modalVisible) {
                                setModalVisible(false);
                        }

                        // Refresh data
                        await fetchBloodSugarReadings();

                        Alert.alert("Success", "Reading deleted successfully");
                } catch (error) {
                        console.error("Error deleting reading:", error);
                        Alert.alert("Error", "Failed to delete reading");
                } finally {
                        setLoading(false);
                }
        };

        const openReadingModal = async (reading) => {
                // If the reading has an image URL, load it
                try {
                        setSelectedReading(reading);
                        setModalVisible(true);
                } catch (error) {
                        console.error("Error opening reading:", error);
                        Alert.alert("Error", "Failed to display reading details");
                }
        };

        const getFilteredData = () => {
                const now = new Date();
                let filteredData = [...bloodSugarData].map(reading => ({
                        ...reading,
                        id: reading.id || Object.keys(bloodSugarData).find(key => bloodSugarData[key] === reading)
                }));

                if (timeFrame === "weekly") {
                        // Filter for the last 7 days
                        const oneWeekAgo = subWeeks(now, 1);
                        filteredData = filteredData.filter((reading) => {
                                const readingDate = new Date(reading.timestamp);
                                return readingDate >= oneWeekAgo;
                        });
                } else if (timeFrame === "monthly") {
                        // Filter for the last 30 days
                        const oneMonthAgo = subMonths(now, 1);
                        filteredData = filteredData.filter((reading) => {
                                const readingDate = new Date(reading.timestamp);
                                return readingDate >= oneMonthAgo;
                        });
                } else if (timeFrame === "yearly") {
                        // Filter for the current year
                        const startOfCurrentYear = startOfYear(now);
                        filteredData = filteredData.filter((reading) => {
                                const readingDate = new Date(reading.timestamp);
                                return readingDate >= startOfCurrentYear;
                        });
                }

                // Sort the filtered data by timestamp
                return filteredData.sort((a, b) => a.timestamp - b.timestamp);
        };

        const getChartData = () => {
                const filteredData = getFilteredData();

                // If no data is available after filtering, return empty chart data
                if (filteredData.length === 0) {
                        return {
                                labels: [],
                                datasets: [{ data: [], color: () => colors.bloodSugar, strokeWidth: 2 }]
                        };
                }

                // Create appropriate time labels based on the timeFrame
                let labels = filteredData.map((reading) => {
                        const date = new Date(reading.timestamp);
                        if (timeFrame === "weekly") {
                                return format(date, "EEE dd"); // Show day of week and date
                        } else if (timeFrame === "monthly") {
                                return format(date, "MM/dd"); // Show month/day for monthly view
                        } else {
                                return format(date, "MMM"); // Show month name for yearly view
                        }
                });

                return {
                        labels,
                        datasets: [
                                {
                                        data: filteredData.map((reading) => reading.value),
                                        color: () => colors.bloodSugar,
                                        strokeWidth: 2,
                                },
                        ],
                };
        };

        // Make sure we have appropriate statistics for each time frame
        const getAverageBloodSugar = () => {
                const filteredData = getFilteredData();
                if (filteredData.length === 0) return 0;
                const sum = filteredData.reduce((acc, reading) => acc + reading.value, 0);
                return Math.round(sum / filteredData.length);
        };

        const getHighestBloodSugar = () => {
                const filteredData = getFilteredData();
                if (filteredData.length === 0) return 0;
                return Math.max(...filteredData.map((reading) => reading.value));
        };

        const getLowestBloodSugar = () => {
                const filteredData = getFilteredData();
                if (filteredData.length === 0) return 0;
                return Math.min(...filteredData.map((reading) => reading.value));
        };

        // Function to generate and download a report
        const downloadReport = async () => {
                try {
                        setDownloadLoading(true);

                        const filteredData = getFilteredData();
                        if (filteredData.length === 0) {
                                Alert.alert("No Data", "There is no data available for the selected time frame");
                                setDownloadLoading(false);
                                return;
                        }

                        // Create a CSV report
                        let csvContent = "Date,Time,Blood Sugar (mg/dL),Meal Status,Notes\n";

                        filteredData.forEach(reading => {
                                const readingDate = format(new Date(reading.timestamp), "MM/dd/yyyy");
                                const readingTime = format(new Date(reading.timestamp), "hh:mm a");
                                const notes = reading.notes ? reading.notes.replace(/,/g, ";").replace(/\n/g, " ") : "";

                                csvContent += `${readingDate},${readingTime},${reading.value},${reading.mealStatus},${notes}\n`;
                        });

                        // Create a summary section
                        csvContent += "\nSummary Statistics\n";
                        csvContent += `Time Period,${timeFrame}\n`;
                        csvContent += `Average Blood Sugar,${getAverageBloodSugar()} mg/dL\n`;
                        csvContent += `Highest Reading,${getHighestBloodSugar()} mg/dL\n`;
                        csvContent += `Lowest Reading,${getLowestBloodSugar()} mg/dL\n`;
                        csvContent += `Total Readings,${filteredData.length}\n`;

                        // Create a file name with current date
                        const fileName = `blood_sugar_report_${format(new Date(), "yyyyMMdd")}.csv`;
                        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

                        // Write the CSV content to a file
                        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                                encoding: FileSystem.EncodingType.UTF8
                        });

                        // Share the file
                        if (Platform.OS === "ios" || Platform.OS === "android") {
                                if (await Sharing.isAvailableAsync()) {
                                        await Sharing.shareAsync(fileUri);
                                } else {
                                        // If sharing is not available, try to use the Share API
                                        Share.share({
                                                title: "Blood Sugar Report",
                                                message: "Your blood sugar report is attached",
                                                url: fileUri
                                        });
                                }
                        }

                        Alert.alert("Success", "Report has been generated and shared");
                } catch (error) {
                        console.error("Error generating report:", error);
                        Alert.alert("Error", "Failed to generate the report");
                } finally {
                        setDownloadLoading(false);
                }
        };

        return (
                <>
                        <SafeAreaView style={styles.container}>
                                <ScrollView
                                        refreshing={isRefreshing}
                                        onRefresh={handleRefresh}
                                >
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
                                                        disabled={loading}
                                                />

                                                <Text style={styles.label}>Meal Status</Text>
                                                <View style={styles.mealStatusContainer}>
                                                        <TouchableOpacity
                                                                style={[styles.mealStatusButton, mealStatus === "before" && styles.mealStatusButtonActive]}
                                                                onPress={() => setMealStatus("before")}
                                                                disabled={loading}
                                                        >
                                                                <Text style={mealStatus === "before" ? styles.mealStatusTextActive : styles.mealStatusText}>
                                                                        Before Meal
                                                                </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                                style={[styles.mealStatusButton, mealStatus === "after" && styles.mealStatusButtonActive]}
                                                                onPress={() => setMealStatus("after")}
                                                                disabled={loading}
                                                        >
                                                                <Text style={mealStatus === "after" ? styles.mealStatusTextActive : styles.mealStatusText}>
                                                                        After Meal
                                                                </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                                style={[styles.mealStatusButton, mealStatus === "fasting" && styles.mealStatusButtonActive]}
                                                                onPress={() => setMealStatus("fasting")}
                                                                disabled={loading}
                                                        >
                                                                <Text style={mealStatus === "fasting" ? styles.mealStatusTextActive : styles.mealStatusText}>
                                                                        Fasting
                                                                </Text>
                                                        </TouchableOpacity>
                                                </View>

                                                {/* Date and Time Input Section */}
                                                <Text style={styles.label}>Date and Time</Text>

                                                <TouchableOpacity
                                                        style={styles.currentTimeToggle}
                                                        onPress={toggleUseCurrentDateTime}
                                                        disabled={loading}
                                                >
                                                        <Icon
                                                                name={useCurrentDateTime ? "check-square" : "square"}
                                                                type="feather"
                                                                size={20}
                                                                color={colors.bloodSugar}
                                                        />
                                                        <Text style={styles.currentTimeToggleText}>
                                                                Use current date and time
                                                        </Text>
                                                </TouchableOpacity>

                                                <View style={styles.dateTimeContainer}>
                                                        <Input
                                                                label="Date"
                                                                placeholder="MM/DD/YYYY"
                                                                value={dateInput}
                                                                onChangeText={handleDateChange}
                                                                leftIcon={<Icon name="calendar" type="feather" size={18} color={useCurrentDateTime ? "#aaa" : colors.bloodSugar} />}
                                                                disabled={useCurrentDateTime || loading}
                                                                errorMessage={dateError}
                                                                containerStyle={styles.dateTimeInput}
                                                                style={useCurrentDateTime ? styles.dateTimeTextDisabled : null}
                                                        />

                                                        <Input
                                                                label="Time"
                                                                placeholder="hh:mm AM/PM"
                                                                value={timeInput}
                                                                onChangeText={handleTimeChange}
                                                                leftIcon={<Icon name="clock" type="feather" size={18} color={useCurrentDateTime ? "#aaa" : colors.bloodSugar} />}
                                                                disabled={useCurrentDateTime || loading}
                                                                errorMessage={timeError}
                                                                containerStyle={styles.dateTimeInput}
                                                                style={useCurrentDateTime ? styles.dateTimeTextDisabled : null}
                                                        />
                                                </View>

                                                <Input
                                                        label="Notes (Optional)"
                                                        placeholder="Add any notes here"
                                                        multiline
                                                        value={notes}
                                                        onChangeText={setNotes}
                                                        leftIcon={<Icon name="file-text" type="feather" size={24} color="#888" />}
                                                        disabled={loading}
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
                                                                                disabled={loading}
                                                                        >
                                                                                <Icon name="x-circle" type="feather" size={24} color="#ff4444" />
                                                                        </TouchableOpacity>
                                                                </View>
                                                        ) : (
                                                                <TouchableOpacity
                                                                        style={styles.uploadButton}
                                                                        onPress={pickImage}
                                                                        disabled={loading}
                                                                >
                                                                        <Icon name="camera" type="feather" size={24} color="#888" />
                                                                        <Text style={styles.uploadText}>Upload Prescription</Text>
                                                                </TouchableOpacity>
                                                        )}
                                                </View>

                                                <Button
                                                        title={loading ? "Adding..." : "Add Reading"}
                                                        icon={loading ? null : <Icon name="plus" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
                                                        onPress={addReading}
                                                        loading={loading}
                                                        disabled={loading}
                                                />
                                        </Card>

                                        <Card containerStyle={styles.card}>
                                                <Card.Title>Blood Sugar Trends</Card.Title>
                                                <Card.Divider />

                                                <View style={styles.timeFrameContainer}>
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

                                                        <TouchableOpacity
                                                                style={[styles.timeFrameButton, timeFrame === "yearly" && styles.timeFrameButtonActive]}
                                                                onPress={() => setTimeFrame("yearly")}
                                                        >
                                                                <Text style={timeFrame === "yearly" ? styles.timeFrameTextActive : styles.timeFrameText}>Yearly</Text>
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

                                                {/* Download Report Button */}
                                                <Button
                                                        title={downloadLoading ? "Generating Report..." : "Download Report"}
                                                        icon={downloadLoading ? null : <Icon name="download" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
                                                        onPress={downloadReport}
                                                        loading={downloadLoading}
                                                        disabled={downloadLoading || getFilteredData().length === 0}
                                                        buttonStyle={styles.downloadButton}
                                                />
                                        </Card>

                                        <Card containerStyle={styles.card}>
                                                <Card.Title>Recent Readings</Card.Title>
                                                <Card.Divider />

                                                {loading && bloodSugarData.length === 0 ? (
                                                        <Text style={styles.loadingText}>Loading readings...</Text>
                                                ) : bloodSugarData.length > 0 ? (
                                                        bloodSugarData
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
                                                                                                {reading.prescriptionImageUrl && (
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
                                                                                {index < bloodSugarData.slice(0, 5).length - 1 && <Divider style={styles.divider} />}
                                                                        </View>
                                                                ))
                                                ) : (
                                                        <Text style={styles.noDataText}>No readings available</Text>
                                                )}

                                                {bloodSugarData.length > 5 && (
                                                        <Button
                                                                title="View All Readings"
                                                                type="outline"
                                                                buttonStyle={styles.viewAllButton}
                                                                onPress={() => {/* Navigate to all readings screen */ }}
                                                        />
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

                                                                        {selectedReading.prescriptionImageUrl ? (
                                                                                <View style={styles.modalImageSection}>
                                                                                        <Text style={styles.modalSectionTitle}>Prescription:</Text>
                                                                                        <Image
                                                                                                source={{ uri: selectedReading.prescriptionImageUrl }}
                                                                                                style={styles.modalImage}
                                                                                                resizeMode="contain"
                                                                                        />
                                                                                </View>
                                                                        ) : (
                                                                                <Text style={styles.noImageText}>No prescription image available</Text>
                                                                        )}

                                                                        <View style={styles.modalButtonsContainer}>
                                                                                <Button
                                                                                        title="Delete"
                                                                                        type="outline"
                                                                                        buttonStyle={styles.deleteButton}
                                                                                        onPress={() => {
                                                                                                Alert.alert(
                                                                                                        "Confirm Delete",
                                                                                                        "Are you sure you want to delete this reading?",
                                                                                                        [
                                                                                                                { text: "Cancel", style: "cancel" },
                                                                                                                {
                                                                                                                        text: "Delete",
                                                                                                                        style: "destructive",
                                                                                                                        onPress: () => deleteReading(
                                                                                                                                selectedReading.id,
                                                                                                                                selectedReading.prescriptionImageUrl
                                                                                                                        )
                                                                                                                }
                                                                                                        ]
                                                                                                );
                                                                                        }}
                                                                                />
                                                                        </View>
                                                                </>
                                                        )}
                                                </View>
                                        </View>
                                </Modal>
                        </SafeAreaView>
                </>
        );
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