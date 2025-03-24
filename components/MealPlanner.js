// components/MealPlanner.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Icon, Divider, CheckBox } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sampleMealPlans } from '../data/dietaryRecommendations';

const MealPlanner=( { modelReady } ) =>
{
        const [ activeGoal, setActiveGoal ]=useState( 'weightLoss' );
        const [ mealPlan, setMealPlan ]=useState( [] );
        const [ savedMeals, setSavedMeals ]=useState( [] );
        const [ completedMeals, setCompletedMeals ]=useState( [] );

        // Load saved data on component mount
        useEffect( () =>
        {
                const loadSavedData=async () =>
                {
                        try
                        {
                                const savedPlan=await AsyncStorage.getItem( 'mealPlan' );
                                const savedGoal=await AsyncStorage.getItem( 'activeGoal' );
                                const savedCompleted=await AsyncStorage.getItem( 'completedMeals' );

                                if ( savedPlan )
                                {
                                        setMealPlan( JSON.parse( savedPlan ) );
                                } else
                                {
                                        // Default to weight loss meal plan if nothing saved
                                        setMealPlan( sampleMealPlans.weightLoss );
                                }

                                if ( savedGoal )
                                {
                                        setActiveGoal( savedGoal );
                                }

                                if ( savedCompleted )
                                {
                                        setCompletedMeals( JSON.parse( savedCompleted ) );
                                }
                        } catch ( error )
                        {
                                console.error( 'Error loading saved meal data:', error );
                        }
                };

                loadSavedData();
        }, [] );

        // Save data when changed
        useEffect( () =>
        {
                const saveData=async () =>
                {
                        try
                        {
                                await AsyncStorage.setItem( 'mealPlan', JSON.stringify( mealPlan ) );
                                await AsyncStorage.setItem( 'activeGoal', activeGoal );
                                await AsyncStorage.setItem( 'completedMeals', JSON.stringify( completedMeals ) );
                        } catch ( error )
                        {
                                console.error( 'Error saving meal data:', error );
                        }
                };

                saveData();
        }, [ mealPlan, activeGoal, completedMeals ] );

        const generateMealPlan=( goal ) =>
        {
                setActiveGoal( goal );
                setMealPlan( sampleMealPlans[ goal ] );

                // In a real app, we would use the model to generate a custom meal plan
                // For now, we're using sample data
                Alert.alert(
                        'Meal Plan Generated',
                        `Your ${ goal==='weightLoss'? 'weight loss':
                                goal==='muscleGain'? 'muscle gain':'energy boosting' } 
      meal plan has been created!`
                );
        };

        const saveMeal=( meal ) =>
        {
                const updatedSavedMeals=[ ...savedMeals ];

                // Check if meal is already saved
                const alreadySaved=updatedSavedMeals.some(
                        savedMeal => savedMeal.food===meal.food&&savedMeal.type===meal.type
                );

                if ( alreadySaved )
                {
                        // Remove the meal if already saved
                        const index=updatedSavedMeals.findIndex(
                                savedMeal => savedMeal.food===meal.food&&savedMeal.type===meal.type
                        );
                        updatedSavedMeals.splice( index, 1 );
                        Alert.alert( 'Removed', 'Meal removed from favorites' );
                } else
                {
                        // Add the meal
                        updatedSavedMeals.push( meal );
                        Alert.alert( 'Saved', 'Meal added to favorites' );
                }

                setSavedMeals( updatedSavedMeals );
        };

        const toggleMealCompletion=( day, mealType, mealFood ) =>
        {
                const mealId=`${ day }-${ mealType }-${ mealFood }`;
                const updatedCompletedMeals=[ ...completedMeals ];

                if ( updatedCompletedMeals.includes( mealId ) )
                {
                        // Remove if already completed
                        const index=updatedCompletedMeals.indexOf( mealId );
                        updatedCompletedMeals.splice( index, 1 );
                } else
                {
                        // Add to completed
                        updatedCompletedMeals.push( mealId );
                }

                setCompletedMeals( updatedCompletedMeals );
        };

        const isMealCompleted=( day, mealType, mealFood ) =>
        {
                const mealId=`${ day }-${ mealType }-${ mealFood }`;
                return completedMeals.includes( mealId );
        };

        const getTotalNutrition=( meals ) =>
        {
                return meals.reduce( ( totals, meal ) =>
                {
                        return {
                                calories: totals.calories+meal.calories,
                                protein: totals.protein+meal.protein,
                                carbs: totals.carbs+meal.carbs,
                                fat: totals.fat+meal.fat
                        };
                }, { calories: 0, protein: 0, carbs: 0, fat: 0 } );
        };

        const isMealSaved=( meal ) =>
        {
                return savedMeals.some(
                        savedMeal => savedMeal.food===meal.food&&savedMeal.type===meal.type
                );
        };

        return (
                <ScrollView style={ styles.container }>
                        <Card containerStyle={ styles.card }>
                                <Card.Title style={ styles.cardTitle }>Your Meal Plan</Card.Title>
                                <Card.Divider />

                                <Text style={ styles.subtitle }>Generate a meal plan based on your goals:</Text>

                                <View style={ styles.goalButtonsContainer }>
                                        <TouchableOpacity
                                                style={ [
                                                        styles.goalButton,
                                                        activeGoal==='weightLoss'&&styles.activeGoalButton
                                                ] }
                                                onPress={ () => generateMealPlan( 'weightLoss' ) }
                                        >
                                                <Icon name="trending-down" type="material" color={ activeGoal==='weightLoss'? '#fff':'#4CAF50' } />
                                                <Text style={ activeGoal==='weightLoss'? styles.activeGoalText:styles.goalText }>Weight Loss</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={ [
                                                        styles.goalButton,
                                                        activeGoal==='muscleGain'&&styles.activeGoalButton
                                                ] }
                                                onPress={ () => generateMealPlan( 'muscleGain' ) }
                                        >
                                                <Icon name="fitness-center" type="material" color={ activeGoal==='muscleGain'? '#fff':'#4CAF50' } />
                                                <Text style={ activeGoal==='muscleGain'? styles.activeGoalText:styles.goalText }>Muscle Gain</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={ [
                                                        styles.goalButton,
                                                        activeGoal==='energyBoost'&&styles.activeGoalButton
                                                ] }
                                                onPress={ () => generateMealPlan( 'energyBoost' ) }
                                        >
                                                <Icon name="bolt" type="material" color={ activeGoal==='energyBoost'? '#fff':'#4CAF50' } />
                                                <Text style={ activeGoal==='energyBoost'? styles.activeGoalText:styles.goalText }>Energy Boost</Text>
                                        </TouchableOpacity>
                                </View>
                        </Card>

                        { mealPlan.map( ( dayPlan, dayIndex ) =>
                        {
                                const dayNutrition=getTotalNutrition( dayPlan.meals );

                                return (
                                        <Card key={ dayIndex } containerStyle={ styles.dayCard }>
                                                <Card.Title style={ styles.dayTitle }>{ dayPlan.day }</Card.Title>
                                                <Card.Divider />

                                                <View style={ styles.nutritionSummary }>
                                                        <Text style={ styles.nutritionLabel }>Daily Totals:</Text>
                                                        <Text style={ styles.nutritionValue }>{ dayNutrition.calories } kcal</Text>
                                                        <Text style={ styles.nutritionValue }>{ dayNutrition.protein }g protein</Text>
                                                        <Text style={ styles.nutritionValue }>{ dayNutrition.carbs }g carbs</Text>
                                                        <Text style={ styles.nutritionValue }>{ dayNutrition.fat }g fat</Text>
                                                </View>

                                                { dayPlan.meals.map( ( meal, mealIndex ) => (
                                                        <View key={ mealIndex } style={ styles.mealContainer }>
                                                                <View style={ styles.mealHeader }>
                                                                        <Text style={ styles.mealType }>{ meal.type }</Text>
                                                                        <View style={ styles.mealActions }>
                                                                                <TouchableOpacity
                                                                                        style={ styles.actionButton }
                                                                                        onPress={ () => saveMeal( meal ) }
                                                                                >
                                                                                        <Icon
                                                                                                name={ isMealSaved( meal )? "favorite":"favorite-border" }
                                                                                                type="material"
                                                                                                size={ 24 }
                                                                                                color={ isMealSaved( meal )? "#FF5252":"#666" }
                                                                                        />
                                                                                </TouchableOpacity>
                                                                                <CheckBox
                                                                                        checked={ isMealCompleted( dayPlan.day, meal.type, meal.food ) }
                                                                                        onPress={ () => toggleMealCompletion( dayPlan.day, meal.type, meal.food ) }
                                                                                        checkedColor="#4CAF50"
                                                                                        uncheckedColor="#999"
                                                                                        containerStyle={ styles.checkbox }
                                                                                />
                                                                        </View>
                                                                </View>

                                                                <Text style={ styles.mealFood }>{ meal.food }</Text>

                                                                <View style={ styles.macroContainer }>
                                                                        <Text style={ styles.macroText }>{ meal.calories } kcal</Text>
                                                                        <Text style={ styles.macroText }>{ meal.protein }g protein</Text>
                                                                        <Text style={ styles.macroText }>{ meal.carbs }g carbs</Text>
                                                                        <Text style={ styles.macroText }>{ meal.fat }g fat</Text>
                                                                </View>

                                                                <Divider style={ styles.mealDivider } />
                                                        </View>
                                                ) ) }
                                        </Card>
                                );
                        } ) }

                        <View style={ styles.buttonContainer }>
                                <Button
                                        title="Regenerate Meal Plan"
                                        icon={ <Icon name="refresh" type="material" color="#fff" style={ { marginRight: 10 } } /> }
                                        buttonStyle={ styles.regenerateButton }
                                        onPress={ () => generateMealPlan( activeGoal ) }
                                />
                        </View>
                </ScrollView>
        );
};

const styles=StyleSheet.create( {
        container: {
                flex: 1,
                backgroundColor: '#f4f4f4',
        },
        card: {
                borderRadius: 10,
                marginBottom: 15,
        },
        cardTitle: {
                fontSize: 22,
                color: '#4CAF50',
        },
        subtitle: {
                fontSize: 16,
                color: '#555',
                marginBottom: 15,
                textAlign: 'center',
        },
        goalButtonsContainer: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginBottom: 10,
        },
        goalButton: {
                alignItems: 'center',
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#4CAF50',
                width: '30%',
        },
        activeGoalButton: {
                backgroundColor: '#4CAF50',
        },
        goalText: {
                color: '#4CAF50',
                marginTop: 5,
                fontWeight: '500',
        },
        activeGoalText: {
                color: '#fff',
                marginTop: 5,
                fontWeight: '500',
        },
        dayCard: {
                borderRadius: 10,
                marginBottom: 15,
        },
        dayTitle: {
                fontSize: 18,
                color: '#333',
        },
        nutritionSummary: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: '#f9f9f9',
                padding: 10,
                borderRadius: 5,
                marginBottom: 15,
                flexWrap: 'wrap',
        },
        nutritionLabel: {
                fontWeight: 'bold',
                color: '#555',
        },
        nutritionValue: {
                color: '#4CAF50',
                fontWeight: '500',
        },
        mealContainer: {
                marginBottom: 10,
        },
        mealHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 5,
        },
        mealType: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#555',
        },
        mealActions: {
                flexDirection: 'row',
                alignItems: 'center',
        },
        actionButton: {
                padding: 5,
        },
        checkbox: {
                margin: 0,
                padding: 0,
                backgroundColor: 'transparent',
                borderWidth: 0,
        },
        mealFood: {
                fontSize: 15,
                color: '#333',
                marginBottom: 5,
        },
        macroContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: 5,
        },
        macroText: {
                fontSize: 12,
                color: '#777',
                marginRight: 10,
        },
        mealDivider: {
                marginVertical: 10,
        },
        buttonContainer: {
                margin: 20,
                marginTop: 5,
        },
        regenerateButton: {
                backgroundColor: '#4CAF50',
                borderRadius: 10,
                padding: 12,
        }
} );

export default MealPlanner;