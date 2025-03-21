"use client"
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { Text, Button, Card, Icon, ListItem, Divider } from '@rneui/themed'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'

// Mock data - in production, you'd fetch this from Nutritionix or Food Data Central APIs
const mockMealSuggestions = {
        low: [
                { name: 'Greek Yogurt with Berries', carbs: 15, protein: 18, fat: 2, calories: 180, glycemicIndex: 'Low' },
                { name: 'Vegetable Omelet', carbs: 8, protein: 14, fat: 12, calories: 240, glycemicIndex: 'Low' },
                { name: 'Grilled Chicken Salad', carbs: 12, protein: 28, fat: 9, calories: 320, glycemicIndex: 'Low' }
        ],
        normal: [
                { name: 'Quinoa Bowl with Vegetables', carbs: 38, protein: 12, fat: 10, calories: 340, glycemicIndex: 'Medium' },
                { name: 'Lentil Soup with Whole Grain Bread', carbs: 45, protein: 18, fat: 6, calories: 380, glycemicIndex: 'Medium' },
                { name: 'Baked Salmon with Sweet Potato', carbs: 30, protein: 22, fat: 12, calories: 360, glycemicIndex: 'Medium' }
        ],
        high: [
                { name: 'Oatmeal with Nuts and Apple', carbs: 45, protein: 8, fat: 12, calories: 320, glycemicIndex: 'Low-Medium' },
                { name: 'Whole Grain Pasta with Lean Turkey', carbs: 52, protein: 25, fat: 8, calories: 420, glycemicIndex: 'Medium' },
                { name: 'Brown Rice with Beans and Avocado', carbs: 58, protein: 15, fat: 14, calories: 450, glycemicIndex: 'Medium' }
        ]
}

const mockFoodDatabase = [
        { name: 'Apple', carbs: 25, protein: 0.5, fat: 0.3, calories: 95, glycemicIndex: 'Medium' },
        { name: 'Chicken Breast', carbs: 0, protein: 31, fat: 3.6, calories: 165, glycemicIndex: 'Low' },
        { name: 'Brown Rice (1 cup)', carbs: 45, protein: 5, fat: 1.8, calories: 216, glycemicIndex: 'Medium' },
        { name: 'Broccoli (1 cup)', carbs: 6, protein: 2.6, fat: 0.3, calories: 31, glycemicIndex: 'Low' },
        { name: 'Salmon (4 oz)', carbs: 0, protein: 25, fat: 13, calories: 233, glycemicIndex: 'Low' },
        { name: 'Sweet Potato (medium)', carbs: 24, protein: 2, fat: 0.1, calories: 103, glycemicIndex: 'Medium' },
        { name: 'Oatmeal (1 cup cooked)', carbs: 27, protein: 5, fat: 3.2, calories: 158, glycemicIndex: 'Low-Medium' },
        { name: 'Avocado (half)', carbs: 6, protein: 2, fat: 15, calories: 161, glycemicIndex: 'Low' },
]

const NutritionScreen = () => {
        const [currentGlucose, setCurrentGlucose] = useState('')
        const [mealType, setMealType] = useState('breakfast')
        const [dietaryPreferences, setDietaryPreferences] = useState('regular')
        const [isLoading, setIsLoading] = useState(false)
        const [suggestions, setSuggestions] = useState([])
        const [showSuggestions, setShowSuggestions] = useState(false)
        const [searchQuery, setSearchQuery] = useState('')
        const [searchResults, setSearchResults] = useState([])
        const [recentMeals, setRecentMeals] = useState([])
        const [errorMessage, setErrorMessage] = useState('')

        useEffect(() => {
                loadRecentMeals()
        }, [])

        const loadRecentMeals = async () => {
                try {
                        const meals = await AsyncStorage.getItem('@recent_meals')
                        if (meals) {
                                setRecentMeals(JSON.parse(meals))
                        }
                } catch (error) {
                        console.error('Error loading recent meals:', error)
                }
        }

        const saveRecentMeal = async (meal) => {
                try {
                        // Add the new meal to the beginning of the array and keep only the most recent 5
                        const updatedMeals = [meal, ...recentMeals.slice(0, 4)]
                        setRecentMeals(updatedMeals)
                        await AsyncStorage.setItem('@recent_meals', JSON.stringify(updatedMeals))
                } catch (error) {
                        console.error('Error saving recent meal:', error)
                }
        }

        const searchFood = (query) => {
                setSearchQuery(query)
                if (query.length > 1) {
                        const results = mockFoodDatabase.filter(item =>
                                item.name.toLowerCase().includes(query.toLowerCase())
                        )
                        setSearchResults(results)
                } else {
                        setSearchResults([])
                }
        }

        const getMealSuggestions = () => {
                if (!currentGlucose || isNaN(parseFloat(currentGlucose))) {
                        setErrorMessage('Please enter a valid blood glucose level')
                        return
                }

                setErrorMessage('')
                setIsLoading(true)

                // Simulate API call delay
                setTimeout(() => {
                        const glucose = parseFloat(currentGlucose)
                        let glucoseCategory

                        // Categorize based on entered glucose level
                        if (glucose < 100) {
                                glucoseCategory = 'low'
                        } else if (glucose >= 100 && glucose <= 140) {
                                glucoseCategory = 'normal'
                        } else {
                                glucoseCategory = 'high'
                        }

                        // Get suggestions based on glucose category
                        setSuggestions(mockMealSuggestions[glucoseCategory])
                        setShowSuggestions(true)
                        setIsLoading(false)
                }, 1500)
        }

        const logMeal = (meal) => {
                // In a real app, you would save this to your database/storage
                Alert.alert('Meal Logged', `You've logged ${meal.name} to your food diary.`)
                saveRecentMeal({
                        ...meal,
                        date: new Date().toISOString(),
                        mealType
                })
        }

        const renderMealSuggestions = () => {
                if (!showSuggestions) return null

                return (
                        <View style={styles.suggestionsContainer}>
                                <Text h4 style={styles.sectionTitle}>Recommended Meals</Text>
                                <Text style={styles.subtitle}>Based on your current glucose level of {currentGlucose} mg/dL</Text>

                                {suggestions.map((meal, index) => (
                                        <Card key={index} containerStyle={styles.mealCard}>
                                                <Card.Title>{meal.name}</Card.Title>
                                                <Card.Divider />
                                                <View style={styles.mealDetails}>
                                                        <Text style={styles.mealInfo}>Carbs: {meal.carbs}g</Text>
                                                        <Text style={styles.mealInfo}>Protein: {meal.protein}g</Text>
                                                        <Text style={styles.mealInfo}>Fat: {meal.fat}g</Text>
                                                        <Text style={styles.mealInfo}>Calories: {meal.calories}</Text>
                                                </View>
                                                <Text style={styles.glycemicIndex}>Glycemic Index: {meal.glycemicIndex}</Text>
                                                <Button
                                                        title="Log This Meal"
                                                        buttonStyle={styles.logButton}
                                                        onPress={() => logMeal(meal)}
                                                />
                                        </Card>
                                ))}
                        </View>
                )
        }

        const renderSearchResults = () => {
                if (searchQuery.length <= 1 || searchResults.length === 0) return null

                return (
                        <View style={styles.searchResultsContainer}>
                                <Text style={styles.resultsTitle}>Search Results</Text>
                                {searchResults.map((food, index) => (
                                        <ListItem key={index} bottomDivider onPress={() => logMeal(food)}>
                                                <ListItem.Content>
                                                        <ListItem.Title>{food.name}</ListItem.Title>
                                                        <ListItem.Subtitle>
                                                                Carbs: {food.carbs}g • Protein: {food.protein}g • {food.calories} cal
                                                        </ListItem.Subtitle>
                                                </ListItem.Content>
                                                <Icon name="plus" type="feather" size={20} />
                                        </ListItem>
                                ))}
                        </View>
                )
        }

        const renderRecentMeals = () => {
                if (recentMeals.length === 0) return null

                return (
                        <View style={styles.recentMealsContainer}>
                                <Text h4 style={styles.sectionTitle}>Recent Meals</Text>
                                {recentMeals.map((meal, index) => {
                                        const date = new Date(meal.date)
                                        const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                                        return (
                                                <ListItem key={index} bottomDivider>
                                                        <ListItem.Content>
                                                                <ListItem.Title>{meal.name}</ListItem.Title>
                                                                <ListItem.Subtitle>
                                                                        {formattedDate} • {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                                                </ListItem.Subtitle>
                                                                <Text style={styles.mealNutrition}>
                                                                        Carbs: {meal.carbs}g • Protein: {meal.protein}g • Fat: {meal.fat}g • {meal.calories} cal
                                                                </Text>
                                                        </ListItem.Content>
                                                </ListItem>
                                        )
                                })}
                        </View>
                )
        }

        return (
                <ScrollView style={styles.container}>
                        <View style={styles.headerContainer}>
                                <Text h3 style={styles.header}>AI Nutrition Advisor</Text>
                                <Text style={styles.description}>
                                        Get personalized meal recommendations based on your current glucose levels and dietary preferences.
                                </Text>
                        </View>

                        <Card containerStyle={styles.inputCard}>
                                <Card.Title>Get Meal Recommendations</Card.Title>
                                <Card.Divider />

                                <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Current Blood Glucose Level</Text>
                                        <View style={styles.inputWithUnit}>
                                                <TextInput
                                                        style={styles.input}
                                                        placeholder="Enter your current glucose level"
                                                        keyboardType="numeric"
                                                        value={currentGlucose}
                                                        onChangeText={setCurrentGlucose}
                                                />
                                                <Text style={styles.unit}>mg/dL</Text>
                                        </View>
                                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                                </View>

                                <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Meal Type</Text>
                                        <View style={styles.pickerContainer}>
                                                <Picker
                                                        selectedValue={mealType}
                                                        onValueChange={(itemValue) => setMealType(itemValue)}
                                                        style={styles.picker}
                                                >
                                                        <Picker.Item label="Breakfast" value="breakfast" />
                                                        <Picker.Item label="Lunch" value="lunch" />
                                                        <Picker.Item label="Dinner" value="dinner" />
                                                        <Picker.Item label="Snack" value="snack" />
                                                </Picker>
                                        </View>
                                </View>

                                <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Dietary Preferences</Text>
                                        <View style={styles.pickerContainer}>
                                                <Picker
                                                        selectedValue={dietaryPreferences}
                                                        onValueChange={(itemValue) => setDietaryPreferences(itemValue)}
                                                        style={styles.picker}
                                                >
                                                        <Picker.Item label="Regular" value="regular" />
                                                        <Picker.Item label="Vegetarian" value="vegetarian" />
                                                        <Picker.Item label="Vegan" value="vegan" />
                                                        <Picker.Item label="Low Carb" value="low-carb" />
                                                        <Picker.Item label="Gluten Free" value="gluten-free" />
                                                </Picker>
                                        </View>
                                </View>

                                <Button
                                        title="Get Recommendations"
                                        icon={
                                                isLoading ? (
                                                        <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                                                ) : (
                                                        <Icon name="search" type="feather" color="white" size={20} style={styles.buttonIcon} />
                                                )
                                        }
                                        disabled={isLoading}
                                        onPress={getMealSuggestions}
                                />
                        </Card>

                        <Divider style={styles.mainDivider} />

                        <View style={styles.searchContainer}>
                                <Text h4 style={styles.sectionTitle}>Search Foods</Text>
                                <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search for a food item..."
                                        value={searchQuery}
                                        onChangeText={searchFood}
                                />
                        </View>

                        {renderSearchResults()}
                        {renderMealSuggestions()}
                        {renderRecentMeals()}

                        <View style={styles.nutritionTipsContainer}>
                                <Text h4 style={styles.sectionTitle}>Nutrition Tips for Diabetes</Text>
                                <Card containerStyle={styles.tipCard}>
                                        <Text style={styles.tipTitle}>Choose Complex Carbohydrates</Text>
                                        <Text style={styles.tipText}>
                                                Opt for whole grains, legumes, and vegetables that are digested more slowly,
                                                causing a slower, lower rise in blood glucose.
                                        </Text>
                                </Card>

                                <Card containerStyle={styles.tipCard}>
                                        <Text style={styles.tipTitle}>Mind Your Portions</Text>
                                        <Text style={styles.tipText}>
                                                Use the plate method: fill half with non-starchy vegetables,
                                                a quarter with lean protein, and a quarter with carbohydrates.
                                        </Text>
                                </Card>

                                <Card containerStyle={styles.tipCard}>
                                        <Text style={styles.tipTitle}>Time Your Meals</Text>
                                        <Text style={styles.tipText}>
                                                Eat at regular times to help maintain blood sugar levels.
                                                Avoid skipping meals, especially if you take diabetes medication.
                                        </Text>
                                </Card>
                        </View>
                </ScrollView>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#f5f5f5',
        },
        headerContainer: {
                padding: 16,
                backgroundColor: '#f0f8ff',
        },
        header: {
                marginBottom: 8,
        },
        description: {
                fontSize: 16,
                color: '#555',
                marginBottom: 10,
        },
        inputCard: {
                borderRadius: 10,
                marginHorizontal: 10,
        },
        inputGroup: {
                marginBottom: 16,
        },
        label: {
                fontSize: 16,
                marginBottom: 8,
                fontWeight: '500',
        },
        input: {
                flex: 1,
                height: 48,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                paddingHorizontal: 12,
                fontSize: 16,
        },
        inputWithUnit: {
                flexDirection: 'row',
                alignItems: 'center',
        },
        unit: {
                marginLeft: 10,
                fontSize: 16,
                color: '#555',
        },
        pickerContainer: {
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                overflow: 'hidden',
        },
        picker: {
                height: 48,
        },
        buttonIcon: {
                marginRight: 10,
        },
        mainDivider: {
                marginVertical: 20,
        },
        sectionTitle: {
                marginVertical: 12,
                paddingHorizontal: 16,
        },
        subtitle: {
                paddingHorizontal: 16,
                color: '#666',
                fontSize: 14,
                marginBottom: 10,
        },
        suggestionsContainer: {
                marginTop: 5,
        },
        mealCard: {
                borderRadius: 10,
                marginHorizontal: 10,
                marginVertical: 8,
        },
        mealDetails: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: 10,
        },
        mealInfo: {
                marginRight: 12,
                marginBottom: 8,
                fontSize: 14,
        },
        glycemicIndex: {
                marginBottom: 12,
                fontWeight: '500',
                fontSize: 14,
        },
        logButton: {
                marginTop: 8,
                backgroundColor: '#4CAF50',
        },
        searchContainer: {
                marginHorizontal: 16,
        },
        searchInput: {
                height: 48,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                paddingHorizontal: 12,
                fontSize: 16,
                backgroundColor: 'white',
        },
        searchResultsContainer: {
                backgroundColor: 'white',
                margin: 16,
                borderRadius: 8,
                padding: 8,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
        },
        resultsTitle: {
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                paddingHorizontal: 8,
        },
        recentMealsContainer: {
                marginVertical: 16,
        },
        mealNutrition: {
                fontSize: 12,
                color: '#666',
                marginTop: 4,
        },
        nutritionTipsContainer: {
                marginBottom: 20,
        },
        tipCard: {
                borderRadius: 8,
                padding: 12,
                marginHorizontal: 10,
                marginVertical: 6,
        },
        tipTitle: {
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 5,
        },
        tipText: {
                fontSize: 14,
                color: '#444',
        },
        errorText: {
                color: 'red',
                marginTop: 5,
        }
})

export default NutritionScreen