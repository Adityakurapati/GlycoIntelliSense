import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, subDays } from 'date-fns';
import { ref, set, onValue, get } from 'firebase/database';
import { db } from '../config/firebase';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function StepsCounter() {
        const [steps, setSteps] = useState(0);
        const [isCounting, setIsCounting] = useState(false);
        const [lastY, setLastY] = useState(0);
        const [lastTimestamp, setLastTimestamp] = useState(0);
        const [chartData, setChartData] = useState([]);
        const [todayGoal, setTodayGoal] = useState(10000);
        const [selectedPeriod, setSelectedPeriod] = useState('week');
        const today = format(new Date(), 'yyyy-MM-dd');
        const screenWidth = Dimensions.get('window').width - 40;

        const { user } = useAuth();

        const userId = user.uid;

        useEffect(() => {
                const todayStepsRef = ref(db, `steps/${userId}/${today}`);
                get(todayStepsRef).then((snapshot) => {
                        if (snapshot.exists()) {
                                setSteps(snapshot.val().count);
                        } else {
                                set(todayStepsRef, { count: 0 });
                        }
                });

                const unsubscribe = onValue(todayStepsRef, (snapshot) => {
                        if (snapshot.exists()) {
                                setSteps(snapshot.val().count);
                        }
                });

                fetchChartData();

                return () => {
                        unsubscribe();
                };
        }, []);

        useEffect(() => {
                const todayStepsRef = ref(db, `steps/${userId}/${today}`);
                set(todayStepsRef, { count: steps });
        }, [steps]);

        const getWeeklySteps = () => {
                if (chartData.length === 0) return 0;
                const last7Days = chartData.slice(-7);
                return last7Days.reduce((sum, day) => sum + day.steps, 0);
        };

        const fetchChartData = async () => {
                const daysToFetch = selectedPeriod === 'week' ? 7 : 30;
                let chartDataArray = [];

                // Fetch data for each day
                for (let i = daysToFetch - 1; i >= 0; i--) {
                        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                        const dateLabel = format(subDays(new Date(), i), 'MMM dd');

                        try {
                                const stepsRef = ref(db, `steps/${userId}/${date}`);
                                const snapshot = await get(stepsRef);
                                const count = snapshot.exists() ? snapshot.val().count : 0;

                                chartDataArray.push({
                                        date: dateLabel,
                                        steps: count,
                                        fullDate: date // Store full date for weekly calculation
                                });
                        } catch (error) {
                                console.error("Error fetching steps data:", error);
                                chartDataArray.push({
                                        date: dateLabel,
                                        steps: 0,
                                        fullDate: date
                                });
                        }
                }

                // Sort the data by date
                chartDataArray.sort((a, b) => {
                        return new Date(a.fullDate) - new Date(b.fullDate);
                });

                setChartData(chartDataArray);
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

                                                setTimeout(() => {
                                                        setIsCounting(false);
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
                const todayStepsRef = ref(db, `steps/${userId}/${today}`);
                set(todayStepsRef, { count: 0 });
        };

        // Prepare data for react-native-chart-kit
        const prepareChartData = () => {
                if (chartData.length === 0) return null;

                return {
                        labels: chartData.map(item => item.date),
                        datasets: [
                                {
                                        data: chartData.map(item => item.steps),
                                        color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
                                        strokeWidth: 2
                                }
                        ]
                };
        };

        const chartConfig = {
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                        borderRadius: 16
                },
                propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#8884d8'
                }
        };

        return (<SafeAreaView style={styles.container}>
                <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                >

                        <View style={styles.header}>
                                <Text style={styles.title}>Steps Tracker</Text>
                                <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
                        </View>

                        <View style={styles.stepCountContainer}>
                                <View style={styles.animationContainer}>
                                        {isCounting ? (
                                                <View style={styles.runningAnimation}>
                                                        <Text style={styles.animationText}>🏃</Text>
                                                </View>
                                        ) : (
                                                <View style={styles.idleAnimation}>
                                                        <Text style={styles.animationText}>🧍</Text>
                                                </View>
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
                                                <Text style={[styles.periodText, selectedPeriod === 'week' && styles.activeText]}>Week</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                                style={[styles.periodButton, selectedPeriod === 'month' && styles.activePeriod]}
                                                onPress={() => changePeriod('month')}
                                        >
                                                <Text style={[styles.periodText, selectedPeriod === 'month' && styles.activeText]}>Month</Text>
                                        </TouchableOpacity>
                                </View>

                                {chartData.length > 0 ? (
                                        <View style={styles.chart}>
                                                <LineChart
                                                        data={prepareChartData()}
                                                        width={screenWidth}
                                                        height={220}
                                                        chartConfig={chartConfig}
                                                        bezier
                                                        style={styles.chartStyle}
                                                />
                                        </View>
                                ) : (
                                        <View style={styles.noDataContainer}>
                                                <Text style={styles.noDataText}>Loading chart data...</Text>
                                        </View>
                                )}
                        </View>

                        <View style={styles.statsContainer}>
                                <View style={styles.statCard}>
                                        <Text style={styles.statLabel}>Average</Text>
                                        <Text style={styles.statValue}>
                                                {chartData.length > 0
                                                        ? Math.round(chartData.reduce((sum, day) => sum + day.steps, 0) / chartData.length)
                                                        : 0}
                                        </Text>
                                        <Text style={styles.statUnit}>steps/day</Text>
                                </View>

                                <View style={styles.statCard}>
                                        <Text style={styles.statLabel}>Best Day</Text>
                                        <Text style={styles.statValue}>
                                                {chartData.length > 0
                                                        ? Math.max(...chartData.map(day => day.steps))
                                                        : 0}
                                        </Text>
                                        <Text style={styles.statUnit}>steps</Text>
                                </View>

                                <View style={styles.statCard}>
                                        <Text style={styles.statLabel}>This Week</Text>
                                        <Text style={styles.statValue}>{getWeeklySteps()}</Text>
                                        <Text style={styles.statUnit}>total steps</Text>
                                </View>
                        </View>

                        <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.resetButton} onPress={resetSteps}>
                                        <Text style={styles.resetButtonText}>Reset Steps</Text>
                                </TouchableOpacity>
                        </View>
                </ScrollView>
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
                width: 80,
                height: 80,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 40,
                backgroundColor: '#f0f0f0',
        },
        runningAnimation: {
                alignItems: 'center',
                justifyContent: 'center',
        },
        idleAnimation: {
                alignItems: 'center',
                justifyContent: 'center',
        },
        animationText: {
                fontSize: 40,
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
        chartStyle: {
                marginVertical: 8,
                borderRadius: 16
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
        activeText: {
                color: 'white',
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
        statsContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20,
        },
        statCard: {
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                flex: 1,
                marginHorizontal: 4,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
        },
        statLabel: {
                fontSize: 14,
                color: '#666',
                marginBottom: 4,
        },
        statValue: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#333',
        },
        statUnit: {
                fontSize: 12,
                color: '#999',
                marginTop: 2,
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