import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { SafeAreaView, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { LineChart } from 'recharts';
import { ref, set, onValue, get } from 'firebase/database';
import { db } from '../config/firebase'; // Assuming firebase.js is configured correctly
import { format, subDays } from 'date-fns';

export default function StepsCounter() {
        const [steps, setSteps] = useState(0);
        const [isCounting, setIsCounting] = useState(false);
        const [lastY, setLastY] = useState(0);
        const [lastTimestamp, setLastTimestamp] = useState(0);
        const [chartData, setChartData] = useState([]);
        const [todayGoal, setTodayGoal] = useState(10000);
        const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week' or 'month'

        const animationRefRunning = useRef(null);
        const animationRefSitting = useRef(null);

        const today = format(new Date(), 'yyyy-MM-dd');

        // Initialize steps from Firebase and setup listener
        useEffect(() => {
                // Get today's steps from Firebase
                const todayStepsRef = ref(db, `steps/${today}`);
                get(todayStepsRef).then((snapshot) => {
                        if (snapshot.exists()) {
                                setSteps(snapshot.val().count);
                        } else {
                                // Create today's entry if it doesn't exist
                                set(todayStepsRef, { count: 0 });
                        }
                });

                // Set up listener for steps updates
                const unsubscribe = onValue(todayStepsRef, (snapshot) => {
                        if (snapshot.exists()) {
                                setSteps(snapshot.val().count);
                        }
                });

                // Fetch historical data for chart
                fetchChartData();

                return () => {
                        unsubscribe();
                };
        }, []);

        // Update Firebase when steps change
        useEffect(() => {
                const todayStepsRef = ref(db, `steps/${today}`);
                set(todayStepsRef, { count: steps });
        }, [steps]);

        // Fetch historical step data for chart
        const fetchChartData = () => {
                const daysToFetch = selectedPeriod === 'week' ? 7 : 30;
                let chartDataArray = [];

                for (let i = daysToFetch - 1; i >= 0; i--) {
                        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                        const dateLabel = format(subDays(new Date(), i), 'MMM dd');

                        const stepsRef = ref(db, `steps/${date}`);
                        get(stepsRef).then((snapshot) => {
                                const count = snapshot.exists() ? snapshot.val().count : 0;
                                chartDataArray.push({
                                        date: dateLabel,
                                        steps: count
                                });

                                // Sort the data by date
                                chartDataArray.sort((a, b) => {
                                        return new Date(a.date) - new Date(b.date);
                                });

                                if (chartDataArray.length === daysToFetch) {
                                        setChartData(chartDataArray);
                                }
                        });
                }
        };

        // Change the time period for the chart
        const changePeriod = (period) => {
                setSelectedPeriod(period);
                fetchChartData();
        };

        useEffect(() => {
                let subscription;

                Accelerometer.isAvailableAsync().then((result) => {
                        if (result) {
                                subscription = Accelerometer.addListener(({ y }) => {
                                        const threshold = 0.1;
                                        const timestamp = new Date().getTime();

                                        if (
                                                Math.abs(y - lastY) > threshold &&
                                                !isCounting &&
                                                timestamp - lastTimestamp > 800
                                        ) {
                                                setIsCounting(true);
                                                setLastY(y);
                                                setLastTimestamp(timestamp);
                                                setSteps((prevSteps) => prevSteps + 1);

                                                // Play running animation when stepping
                                                if (animationRefRunning.current) {
                                                        animationRefRunning.current.play();
                                                }

                                                setTimeout(() => {
                                                        setIsCounting(false);
                                                        // Reset animation when not stepping
                                                        if (animationRefRunning.current) {
                                                                animationRefRunning.current.reset();
                                                        }
                                                        if (animationRefSitting.current && !isCounting) {
                                                                animationRefSitting.current.play();
                                                        }
                                                }, 1200);
                                        }
                                });

                                // Set update frequency
                                Accelerometer.setUpdateInterval(100);
                        } else {
                                console.log("Accelerometer Not Available");
                        }
                });

                return () => {
                        if (subscription) {
                                subscription.remove();
                        }
                };
        }, [isCounting, lastY, lastTimestamp]);

        const resetSteps = () => {
                setSteps(0);
                // Update Firebase with reset
                const todayStepsRef = ref(db, `steps/${today}`);
                set(todayStepsRef, { count: 0 });
        };

        return (
                <SafeAreaView style={styles.container}>
                        <View style={styles.header}>
                                <Text style={styles.title}>Steps Tracker</Text>
                                <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
                        </View>

                        <View style={styles.stepCountContainer}>
                                <View style={styles.animationContainer}>
                                        {isCounting ? (
                                                <LottieView
                                                        ref={animationRefRunning}
                                                        source={require('./assets/running-animation.json')} // Add your animation file
                                                        style={styles.animation}
                                                        autoPlay
                                                        loop
                                                />
                                        ) : (
                                                <LottieView
                                                        ref={animationRefSitting}
                                                        source={require('./assets/idle-animation.json')} // Add your animation file
                                                        style={styles.animation}
                                                        autoPlay
                                                        loop
                                                />
                                        )}
                                </View>

                                <View style={styles.stepsDisplay}>
                                        <Text style={styles.stepsCount}>{steps}</Text>
                                        <Text style={styles.stepsLabel}>steps</Text>
                                        <View style={styles.progressContainer}>
                                                <View style={[styles.progressBar, { width: `${Math.min(100, (steps / todayGoal) * 100)}%` }]} />
                                                <Text style={styles.goalText}>{Math.round((steps / todayGoal) * 100)}% of daily goal</Text>
                                        </View>
                                </View>
                        </View>

                        <View style={styles.chartContainer}>
                                <View style={styles.periodSelector}>
                                        <TouchableOpacity
                                                style={[styles.periodButton, selectedPeriod === 'week' && styles.activePeriod]}
                                                onPress={() => changePeriod('week')}
                                        >
                                                <Text style={styles.periodText}>Week</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                                style={[styles.periodButton, selectedPeriod === 'month' && styles.activePeriod]}
                                                onPress={() => changePeriod('month')}
                                        >
                                                <Text style={styles.periodText}>Month</Text>
                                        </TouchableOpacity>
                                </View>

                                {chartData.length > 0 ? (
                                        <View style={styles.chart}>
                                                <LineChart
                                                        width={350}
                                                        height={200}
                                                        data={chartData}
                                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                >
                                                        <XAxis dataKey="date" />
                                                        <YAxis />
                                                        <LineChart.Line type="monotone" dataKey="steps" stroke="#8884d8" strokeWidth={2} />
                                                        <LineChart.Tooltip />
                                                </LineChart>
                                        </View>
                                ) : (
                                        <View style={styles.noDataContainer}>
                                                <Text style={styles.noDataText}>Loading chart data...</Text>
                                        </View>
                                )}
                        </View>

                        <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.resetButton} onPress={resetSteps}>
                                        <Text style={styles.resetButtonText}>Reset Steps</Text>
                                </TouchableOpacity>
                        </View>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                padding: 16,
                backgroundColor: '#f5f5f5',
        },
        header: {
                alignItems: 'center',
                marginBottom: 20,
        },
        title: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#333',
        },
        date: {
                fontSize: 16,
                color: '#666',
        },
        stepCountContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 20,
        },
        animationContainer: {
                width: 100,
                height: 100,
        },
        animation: {
                width: '100%',
                height: '100%',
        },
        stepsDisplay: {
                flex: 1,
                marginLeft: 16,
                alignItems: 'flex-start',
        },
        stepsCount: {
                fontSize: 40,
                fontWeight: 'bold',
                color: '#333',
        },
        stepsLabel: {
                fontSize: 18,
                color: '#666',
                marginBottom: 8,
        },
        progressContainer: {
                width: '100%',
                height: 10,
                backgroundColor: '#e0e0e0',
                borderRadius: 5,
                marginTop: 8,
        },
        progressBar: {
                height: '100%',
                backgroundColor: '#4CAF50',
                borderRadius: 5,
        },
        goalText: {
                fontSize: 14,
                color: '#666',
                marginTop: 4,
        },
        chartContainer: {
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 20,
        },
        periodSelector: {
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 16,
        },
        periodButton: {
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginHorizontal: 8,
                borderRadius: 20,
                backgroundColor: '#f0f0f0',
        },
        activePeriod: {
                backgroundColor: '#4CAF50',
        },
        periodText: {
                fontWeight: '500',
                color: '#333',
        },
        chart: {
                alignItems: 'center',
        },
        noDataContainer: {
                height: 200,
                justifyContent: 'center',
                alignItems: 'center',
        },
        noDataText: {
                color: '#999',
                fontSize: 16,
        },
        buttonContainer: {
                alignItems: 'center',
        },
        resetButton: {
                backgroundColor: '#f44336',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
        },
        resetButtonText: {
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
        },
});