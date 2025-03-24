import React, { useState, useEffect } from 'react';
import {
        StyleSheet,
        View,
        Text,
        SafeAreaView,
        ScrollView,
        TouchableOpacity,
        Image,
        StatusBar
} from 'react-native';
import { Button, Card, Icon, SearchBar, Overlay } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MealPlanner from '../components/MealPlanner';
import { dietaryRecommendations } from '../data/dietaryRecommendations';
import { foodDatabase } from '../data/foodDatabase';

const NutritionScreen = () => {
        const [activeTab, setActiveTab] = useState('home');
        const [searchQuery, setSearchQuery] = useState('');
        const [filteredFoods, setFilteredFoods] = useState([]);
        const [selectedFood, setSelectedFood] = useState(null);
        const [foodDetailsVisible, setFoodDetailsVisible] = useState(false);
        const [recommendationsFilter, setRecommendationsFilter] = useState('all');
        const [userProfile, setUserProfile] = useState({
                name: 'User',
                weight: 70,
                height: 175,
                goal: 'weight loss',
                dietaryRestrictions: ['none'],
                activityLevel: 'moderate'
        });
        const [modelReady, setModelReady] = useState(false);
        const [menuVisible, setMenuVisible] = useState(false);

        useEffect(() => {
                // Load user profile from storage
                const loadUserProfile = async () => {
                        try {
                                const savedProfile = await AsyncStorage.getItem('userProfile');
                                if (savedProfile) {
                                        setUserProfile(JSON.parse(savedProfile));
                                }
                        } catch (error) {
                                console.error('Error loading user profile:', error);
                        }
                };

                // Simulate AI model loading
                const loadModel = () => {
                        setTimeout(() => {
                                setModelReady(true);
                        }, 2000);
                };

                loadUserProfile();
                loadModel();
        }, []);

        useEffect(() => {
                // Filter foods based on search query
                if (searchQuery.trim() === '') {
                        setFilteredFoods([]);
                } else {
                        const results = foodDatabase.filter(food =>
                                food.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        setFilteredFoods(results);
                }
        }, [searchQuery]);

        const handleSearchChange = (text) => {
                setSearchQuery(text);
        };

        const handleFoodSelect = (food) => {
                setSelectedFood(food);
                setFoodDetailsVisible(true);
        };

        const getFilteredRecommendations = () => {
                if (recommendationsFilter === 'all') {
                        return dietaryRecommendations;
                }

                return dietaryRecommendations.filter(rec =>
                        rec.suitableFor.includes(recommendationsFilter)
                );
        };

        const renderHomeTab = () => (
                <ScrollView style={styles.tabContent}>
                        <Card containerStyle={styles.welcomeCard}>
                                <Card.Title style={styles.welcomeTitle}>
                                        Welcome to NutriSmart AI
                                </Card.Title>
                                <Card.Image
                                        source={{ uri: 'https://img.freepik.com/premium-photo/healthy-lifestyle-food-nutrition-concept-white-wooden-table_53476-3797.jpg?ga=GA1.1.1583118789.1742447122&semt=ais_hybrid' }}
                                        style={styles.cardImage}
                                />
                                <Text style={styles.welcomeText}>
                                        Your personalized AI nutrition advisor to help you achieve your health and fitness goals.
                                </Text>
                                <Button
                                        title="Personalize Your Plan"
                                        buttonStyle={styles.primaryButton}
                                        onPress={() => setActiveTab('plan')}
                                        icon={<Icon name="restaurant" type="material" color="#fff" style={{ marginRight: 10 }} />}
                                />
                        </Card>

                        <Card containerStyle={styles.card}>
                                <Card.Title style={styles.cardTitle}>Daily Recommendation</Card.Title>
                                <Card.Divider />
                                {modelReady ? (
                                        <View>
                                                <Text style={styles.recommendationTitle}>{dietaryRecommendations[Math.floor(Math.random() * dietaryRecommendations.length)].title}</Text>
                                                <Text style={styles.recommendationText}>
                                                        Based on your profile and goals, we recommend focusing on this area today.
                                                </Text>
                                                <Button
                                                        title="See More Recommendations"
                                                        buttonStyle={styles.secondaryButton}
                                                        onPress={() => setActiveTab('recommendations')}
                                                />
                                        </View>
                                ) : (
                                        <View style={styles.loadingContainer}>
                                                <Text style={styles.loadingText}>Analyzing your nutrition needs...</Text>
                                        </View>
                                )}
                        </Card>

                        <Card containerStyle={styles.card}>
                                <Card.Title style={styles.cardTitle}>Nutrition Insights</Card.Title>
                                <Card.Divider />
                                <View style={styles.insightsContainer}>
                                        <View style={styles.insightItem}>
                                                <Icon name="local-fire-department" type="material" size={30} color="#FF5252" />
                                                <Text style={styles.insightValue}>1,850</Text>
                                                <Text style={styles.insightLabel}>cal/day</Text>
                                        </View>
                                        <View style={styles.insightItem}>
                                                <Icon name="fitness-center" type="material" size={30} color="#4CAF50" />
                                                <Text style={styles.insightValue}>120g</Text>
                                                <Text style={styles.insightLabel}>protein</Text>
                                        </View>
                                        <View style={styles.insightItem}>
                                                <Icon name="opacity" type="material" size={30} color="#2196F3" />
                                                <Text style={styles.insightValue}>2.5L</Text>
                                                <Text style={styles.insightLabel}>water</Text>
                                        </View>
                                </View>
                        </Card>
                </ScrollView>
        );

        const renderFoodTab = () => (
                <View style={styles.tabContent}>
                        <SearchBar
                                placeholder="Search for foods..."
                                onChangeText={handleSearchChange}
                                value={searchQuery}
                                containerStyle={styles.searchBarContainer}
                                inputContainerStyle={styles.searchBarInput}
                                lightTheme
                                round
                        />

                        <ScrollView style={styles.foodList}>
                                {filteredFoods.length > 0 ? (
                                        filteredFoods.map((food, index) => (
                                                <TouchableOpacity
                                                        key={index}
                                                        style={styles.foodItem}
                                                        onPress={() => handleFoodSelect(food)}
                                                >
                                                        <View style={styles.foodItemContent}>
                                                                <Text style={styles.foodName}>{food.name}</Text>
                                                                <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                                                        </View>
                                                        <Icon name="chevron-right" type="material" color="#999" />
                                                </TouchableOpacity>
                                        ))
                                ) : searchQuery.trim() !== '' ? (
                                        <Text style={styles.noResultsText}>No foods found matching your search</Text>
                                ) : (
                                        <View style={styles.foodSearchPrompt}>
                                                <Icon name="search" type="material" size={50} color="#ddd" />
                                                <Text style={styles.foodSearchPromptText}>
                                                        Search for foods to view detailed nutrition information
                                                </Text>
                                        </View>
                                )}
                        </ScrollView>

                        <Overlay
                                isVisible={foodDetailsVisible}
                                onBackdropPress={() => setFoodDetailsVisible(false)}
                                overlayStyle={styles.foodDetailsOverlay}
                        >
                                {selectedFood && (
                                        <View>
                                                <Text style={styles.foodDetailsTitle}>{selectedFood.name}</Text>
                                                <View style={styles.nutritionFactsContainer}>
                                                        <Text style={styles.nutritionFactsHeader}>Nutrition Facts</Text>
                                                        <View style={styles.nutritionFactsRow}>
                                                                <Text style={styles.nutritionFactsLabel}>Calories:</Text>
                                                                <Text style={styles.nutritionFactsValue}>{selectedFood.calories}</Text>
                                                        </View>
                                                        <View style={styles.nutritionFactsRow}>
                                                                <Text style={styles.nutritionFactsLabel}>Protein:</Text>
                                                                <Text style={styles.nutritionFactsValue}>{selectedFood.protein}</Text>
                                                        </View>
                                                        <View style={styles.nutritionFactsRow}>
                                                                <Text style={styles.nutritionFactsLabel}>Carbs:</Text>
                                                                <Text style={styles.nutritionFactsValue}>{selectedFood.carbs}</Text>
                                                        </View>
                                                        <View style={styles.nutritionFactsRow}>
                                                                <Text style={styles.nutritionFactsLabel}>Fat:</Text>
                                                                <Text style={styles.nutritionFactsValue}>{selectedFood.fat}</Text>
                                                        </View>
                                                </View>

                                                <Text style={styles.foodDetailsSectionTitle}>Vitamins</Text>
                                                <View style={styles.tagsContainer}>
                                                        {selectedFood.vitamins.map((vitamin, idx) => (
                                                                <View key={idx} style={styles.tag}>
                                                                        <Text style={styles.tagText}>{vitamin}</Text>
                                                                </View>
                                                        ))}
                                                </View>

                                                <Text style={styles.foodDetailsSectionTitle}>Minerals</Text>
                                                <View style={styles.tagsContainer}>
                                                        {selectedFood.minerals.map((mineral, idx) => (
                                                                <View key={idx} style={styles.tag}>
                                                                        <Text style={styles.tagText}>{mineral}</Text>
                                                                </View>
                                                        ))}
                                                </View>

                                                {selectedFood.benefits.length > 0 && (
                                                        <>
                                                                <Text style={styles.foodDetailsSectionTitle}>Benefits</Text>
                                                                <View style={styles.tagsContainer}>
                                                                        {selectedFood.benefits.map((benefit, idx) => (
                                                                                <View key={idx} style={[styles.tag, styles.benefitTag]}>
                                                                                        <Text style={styles.tagText}>{benefit}</Text>
                                                                                </View>
                                                                        ))}
                                                                </View>
                                                        </>
                                                )}

                                                <TouchableOpacity
                                                        style={styles.closeButton}
                                                        onPress={() => setFoodDetailsVisible(false)}
                                                >
                                                        <Text style={styles.closeButtonText}>Close</Text>
                                                </TouchableOpacity>
                                        </View>
                                )}
                        </Overlay>
                </View>
        );

        const renderRecommendationsTab = () => (
                <View style={styles.tabContent}>
                        <View style={styles.filterContainer}>
                                <Text style={styles.filterLabel}>Filter by diet type:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                                        <TouchableOpacity
                                                style={[styles.filterButton, recommendationsFilter === 'all' && styles.activeFilterButton]}
                                                onPress={() => setRecommendationsFilter('all')}
                                        >
                                                <Text style={[styles.filterButtonText, recommendationsFilter === 'all' && styles.activeFilterButtonText]}>All</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                                style={[styles.filterButton, recommendationsFilter === 'vegetarian' && styles.activeFilterButton]}
                                                onPress={() => setRecommendationsFilter('vegetarian')}
                                        >
                                                <Text style={[styles.filterButtonText, recommendationsFilter === 'vegetarian' && styles.activeFilterButtonText]}>Vegetarian</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                                style={[styles.filterButton, recommendationsFilter === 'vegan' && styles.activeFilterButton]}
                                                onPress={() => setRecommendationsFilter('vegan')}
                                        >
                                                <Text style={[styles.filterButtonText, recommendationsFilter === 'vegan' && styles.activeFilterButtonText]}>Vegan</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                                style={[styles.filterButton, recommendationsFilter === 'gluten-free' && styles.activeFilterButton]}
                                                onPress={() => setRecommendationsFilter('gluten-free')}
                                        >
                                                <Text style={[styles.filterButtonText, recommendationsFilter === 'gluten-free' && styles.activeFilterButtonText]}>Gluten-Free</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                                style={[styles.filterButton, recommendationsFilter === 'keto' && styles.activeFilterButton]}
                                                onPress={() => setRecommendationsFilter('keto')}
                                        >
                                                <Text style={[styles.filterButtonText, recommendationsFilter === 'keto' && styles.activeFilterButtonText]}>Keto</Text>
                                        </TouchableOpacity>
                                </ScrollView>
                        </View>

                        <ScrollView style={styles.recommendationsList}>
                                {getFilteredRecommendations().map((recommendation, index) => (
                                        <Card key={index} containerStyle={styles.recommendationCard}>
                                                <Card.Title style={styles.recommendationCardTitle}>{recommendation.title}</Card.Title>
                                                <Card.Divider />
                                                <Text style={styles.recommendationDescription}>{recommendation.description}</Text>

                                                {recommendation.benefits && (
                                                        <View style={styles.recommendationSection}>
                                                                <Text style={styles.recommendationSectionTitle}>Benefits:</Text>
                                                                <View style={styles.tagsContainer}>
                                                                        {recommendation.benefits.map((benefit, idx) => (
                                                                                <View key={idx} style={[styles.tag, styles.benefitTag]}>
                                                                                        <Text style={styles.tagText}>{benefit}</Text>
                                                                                </View>
                                                                        ))}
                                                                </View>
                                                        </View>
                                                )}

                                                {recommendation.foods && (
                                                        <View style={styles.recommendationSection}>
                                                                <Text style={styles.recommendationSectionTitle}>Recommended Foods:</Text>
                                                                <View style={styles.tagsContainer}>
                                                                        {recommendation.foods.map((food, idx) => (
                                                                                <View key={idx} style={styles.tag}>
                                                                                        <Text style={styles.tagText}>{food}</Text>
                                                                                </View>
                                                                        ))}
                                                                </View>
                                                        </View>
                                                )}

                                                {recommendation.avoidFoods && (
                                                        <View style={styles.recommendationSection}>
                                                                <Text style={styles.recommendationSectionTitle}>Foods to Avoid:</Text>
                                                                <View style={styles.tagsContainer}>
                                                                        {recommendation.avoidFoods.map((food, idx) => (
                                                                                <View key={idx} style={[styles.tag, styles.avoidTag]}>
                                                                                        <Text style={styles.tagText}>{food}</Text>
                                                                                </View>
                                                                        ))}
                                                                </View>
                                                        </View>
                                                )}

                                                <Button
                                                        title="Add to My Plan"
                                                        buttonStyle={styles.secondaryButton}
                                                        onPress={() => setActiveTab('plan')}
                                                />
                                        </Card>
                                ))}
                        </ScrollView>
                </View>
        );

        const renderPlanTab = () => (
                <View style={styles.tabContent}>
                        <MealPlanner modelReady={modelReady} />
                </View>
        );

        const renderProfileTab = () => (
                <ScrollView style={styles.tabContent}>
                        <Card containerStyle={styles.profileCard}>
                                <View style={styles.profileHeader}>
                                        <Icon
                                                name="account-circle"
                                                type="material"
                                                size={80}
                                                color="#4CAF50"
                                        />
                                        <Text style={styles.profileName}>{userProfile.name}</Text>
                                </View>

                                <Card.Divider />

                                <View style={styles.profileInfo}>
                                        <View style={styles.profileInfoRow}>
                                                <Text style={styles.profileInfoLabel}>Weight:</Text>
                                                <Text style={styles.profileInfoValue}>{userProfile.weight} kg</Text>
                                        </View>
                                        <View style={styles.profileInfoRow}>
                                                <Text style={styles.profileInfoLabel}>Height:</Text>
                                                <Text style={styles.profileInfoValue}>{userProfile.height} cm</Text>
                                        </View>
                                        <View style={styles.profileInfoRow}>
                                                <Text style={styles.profileInfoLabel}>Goal:</Text>
                                                <Text style={styles.profileInfoValue}>{userProfile.goal}</Text>
                                        </View>
                                        <View style={styles.profileInfoRow}>
                                                <Text style={styles.profileInfoLabel}>Activity Level:</Text>
                                                <Text style={styles.profileInfoValue}>{userProfile.activityLevel}</Text>
                                        </View>
                                        <View style={styles.profileInfoRow}>
                                                <Text style={styles.profileInfoLabel}>Dietary Restrictions:</Text>
                                                <View style={styles.tagsContainer}>
                                                        {userProfile.dietaryRestrictions.map((restriction, idx) => (
                                                                <View key={idx} style={styles.tag}>
                                                                        <Text style={styles.tagText}>{restriction}</Text>
                                                                </View>
                                                        ))}
                                                </View>
                                        </View>
                                </View>

                                <Button
                                        title="Edit Profile"
                                        buttonStyle={styles.primaryButton}
                                        icon={<Icon name="edit" type="material" color="#fff" style={{ marginRight: 10 }} />}
                                />
                        </Card>

                        <Card containerStyle={styles.card}>
                                <Card.Title style={styles.cardTitle}>AI Settings</Card.Title>
                                <Card.Divider />

                                <View style={styles.settingsContainer}>
                                        <View style={styles.settingItem}>
                                                <Text style={styles.settingLabel}>AI Recommendations</Text>
                                                <TouchableOpacity style={styles.toggle}>
                                                        <View style={styles.toggleCircle} />
                                                </TouchableOpacity>
                                        </View>

                                        <View style={styles.settingItem}>
                                                <Text style={styles.settingLabel}>Notifications</Text>
                                                <TouchableOpacity style={[styles.toggle, styles.toggleActive]}>
                                                        <View style={[styles.toggleCircle, styles.toggleCircleActive]} />
                                                </TouchableOpacity>
                                        </View>

                                        <View style={styles.settingItem}>
                                                <Text style={styles.settingLabel}>Meal Reminders</Text>
                                                <TouchableOpacity style={[styles.toggle, styles.toggleActive]}>
                                                        <View style={[styles.toggleCircle, styles.toggleCircleActive]} />
                                                </TouchableOpacity>
                                        </View>

                                        <View style={styles.settingItem}>
                                                <Text style={styles.settingLabel}>Data Sharing</Text>
                                                <TouchableOpacity style={styles.toggle}>
                                                        <View style={styles.toggleCircle} />
                                                </TouchableOpacity>
                                        </View>
                                </View>
                        </Card>
                </ScrollView>
        );

        return (
                <SafeAreaView style={styles.container}>
                        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

                        <View style={styles.header}>
                                <Text style={styles.headerTitle}>NutriSmart AI</Text>
                        </View>

                        {activeTab === 'home' && renderHomeTab()}
                        {activeTab === 'food' && renderFoodTab()}
                        {activeTab === 'recommendations' && renderRecommendationsTab()}
                        {activeTab === 'plan' && renderPlanTab()}
                        {activeTab === 'profile' && renderProfileTab()}

                        <View style={styles.floatingMenuContainer}>
                                {menuVisible && (
                                        <View style={styles.verticalMenu}>
                                                <TouchableOpacity
                                                        style={[styles.menuItem, activeTab === 'profile' && styles.activeMenuItem]}
                                                        onPress={() => {
                                                                setActiveTab('profile');
                                                                setMenuVisible(false);
                                                        }}
                                                >
                                                        <Icon
                                                                name="person"
                                                                type="material"
                                                                color={activeTab === 'profile' ? '#fff' : '#4CAF50'}
                                                                size={22}
                                                        />
                                                        <Text style={[styles.menuItemText, activeTab === 'profile' && styles.activeMenuItemText]}>
                                                                Profile
                                                        </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.menuItem, activeTab === 'plan' && styles.activeMenuItem]}
                                                        onPress={() => {
                                                                setActiveTab('plan');
                                                                setMenuVisible(false);
                                                        }}
                                                >
                                                        <Icon
                                                                name="calendar-today"
                                                                type="material"
                                                                color={activeTab === 'plan' ? '#fff' : '#4CAF50'}
                                                                size={22}
                                                        />
                                                        <Text style={[styles.menuItemText, activeTab === 'plan' && styles.activeMenuItemText]}>
                                                                Plan
                                                        </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.menuItem, activeTab === 'recommendations' && styles.activeMenuItem]}
                                                        onPress={() => {
                                                                setActiveTab('recommendations');
                                                                setMenuVisible(false);
                                                        }}
                                                >
                                                        <Icon
                                                                name="lightbulb"
                                                                type="material"
                                                                color={activeTab === 'recommendations' ? '#fff' : '#4CAF50'}
                                                                size={22}
                                                        />
                                                        <Text style={[styles.menuItemText, activeTab === 'recommendations' && styles.activeMenuItemText]}>
                                                                Tips
                                                        </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.menuItem, activeTab === 'food' && styles.activeMenuItem]}
                                                        onPress={() => {
                                                                setActiveTab('food');
                                                                setMenuVisible(false);
                                                        }}
                                                >
                                                        <Icon
                                                                name="restaurant-menu"
                                                                type="material"
                                                                color={activeTab === 'food' ? '#fff' : '#4CAF50'}
                                                                size={22}
                                                        />
                                                        <Text style={[styles.menuItemText, activeTab === 'food' && styles.activeMenuItemText]}>
                                                                Foods
                                                        </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                        style={[styles.menuItem, activeTab === 'home' && styles.activeMenuItem]}
                                                        onPress={() => {
                                                                setActiveTab('home');
                                                                setMenuVisible(false);
                                                        }}
                                                >
                                                        <Icon
                                                                name="home"
                                                                type="material"
                                                                color={activeTab === 'home' ? '#fff' : '#4CAF50'}
                                                                size={22}
                                                        />
                                                        <Text style={[styles.menuItemText, activeTab === 'home' && styles.activeMenuItemText]}>
                                                                Home
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                )}

                                <TouchableOpacity
                                        style={styles.menuToggleButton}
                                        onPress={() => setMenuVisible(!menuVisible)}
                                >
                                        <Icon
                                                name={menuVisible ? "close" : "menu"}
                                                type="material"
                                                color="#fff"
                                                size={28}
                                        />
                                </TouchableOpacity>
                        </View>
                </SafeAreaView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#f4f4f4',
        },
        header: {
                backgroundColor: '#fff',
                paddingVertical: 15,
                paddingHorizontal: 20,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
        },
        headerTitle: {
                fontSize: 22,
                fontWeight: 'bold',
                color: '#4CAF50',
        },
        tabContent: {
                flex: 1,
                padding: 15,
                paddingBottom: 70, // Space for tab bar
        },
        welcomeCard: {
                borderRadius: 10,
                padding: 15,
        },
        welcomeTitle: {
                fontSize: 24,
                color: '#4CAF50',
                marginBottom: 10,
        },
        cardImage: {
                height: 150,
                borderRadius: 8,
                marginBottom: 15,
        },
        welcomeText: {
                fontSize: 16,
                color: '#555',
                lineHeight: 24,
                marginBottom: 20,
        },
        card: {
                borderRadius: 10,
                marginBottom: 15,
        },
        cardTitle: {
                fontSize: 18,
                color: '#4CAF50',
        },
        primaryButton: {
                backgroundColor: '#4CAF50',
                borderRadius: 8,
                paddingVertical: 12,
        },
        secondaryButton: {
                backgroundColor: '#8BC34A',
                borderRadius: 8,
                paddingVertical: 10,
                marginTop: 15,
        },
        loadingContainer: {
                alignItems: 'center',
                paddingVertical: 20,
        },
        loadingText: {
                color: '#666',
                fontSize: 16,
        },
        recommendationTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
                marginBottom: 10,
        },
        recommendationText: {
                fontSize: 16,
                color: '#666',
                lineHeight: 22,
        },
        insightsContainer: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                padding: 10,
        },
        insightItem: {
                alignItems: 'center',
        },
        insightValue: {
                fontWeight: 'bold',
                fontSize: 18,
                marginTop: 5,
        },
        insightLabel: {
                color: '#666',
                fontSize: 14,
        },
        tabBar: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor: '#fff',
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: '#eee',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
        },
        tabBarItem: {
                alignItems: 'center',
                paddingVertical: 5,
        },
        tabBarText: {
                fontSize: 12,
                color: '#999',
                marginTop: 3,
        },
        tabBarActiveText: {
                color: '#4CAF50',
                fontWeight: 'bold',
        },
        searchBarContainer: {
                backgroundColor: 'transparent',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                paddingHorizontal: 0,
                marginBottom: 15,
        },
        searchBarInput: {
                backgroundColor: '#f0f0f0',
                borderRadius: 10,
        },
        foodList: {
                flex: 1,
        },
        foodItem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
        },
        foodItemContent: {
                flex: 1,
        },
        foodName: {
                fontSize: 16,
                fontWeight: '500',
                color: '#333',
        },
        foodCalories: {
                fontSize: 14,
                color: '#777',
                marginTop: 3,
        },
        noResultsText: {
                textAlign: 'center',
                color: '#999',
                fontSize: 16,
                marginTop: 40,
        },
        foodSearchPrompt: {
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 50,
        },
        foodSearchPromptText: {
                color: '#999',
                textAlign: 'center',
                fontSize: 16,
                marginTop: 15,
                paddingHorizontal: 40,
        },
        foodDetailsOverlay: {
                width: '90%',
                padding: 20,
                borderRadius: 10,
        },
        foodDetailsTitle: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#333',
                marginBottom: 15,
        },
        nutritionFactsContainer: {
                backgroundColor: '#f9f9f9',
                borderRadius: 8,
                padding: 15,
                marginBottom: 20,
        },
        nutritionFactsHeader: {
                fontSize: 18,
                fontWeight: 'bold',
                borderBottomWidth: 2,
                borderBottomColor: '#333',
                paddingBottom: 5,
                marginBottom: 10,
        },
        nutritionFactsRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 5,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
        },
        nutritionFactsLabel: {
                fontSize: 16,
                color: '#333',
        },
        nutritionFactsValue: {
                fontSize: 16,
                fontWeight: '500',
                color: '#333',
        },
        foodDetailsSectionTitle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#444',
                marginTop: 15,
                marginBottom: 8,
        },
        tagsContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: 10,
        },
        tag: {
                backgroundColor: '#e0e0e0',
                borderRadius: 20,
                paddingVertical: 5,
                paddingHorizontal: 10,
                marginRight: 8,
                marginBottom: 8,
        },
        benefitTag: {
                backgroundColor: '#d4edda',
        },
        avoidTag: {
                backgroundColor: '#f8d7da',
        },
        tagText: {
                fontSize: 14,
                color: '#333',
        },
        closeButton: {
                backgroundColor: '#4CAF50',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                marginTop: 20,
        },
        closeButtonText: {
                color: '#fff',
                fontSize: 16,
                fontWeight: '500',
        },
        filterContainer: {
                marginBottom: 15,
        },
        filterLabel: {
                fontSize: 16,
                color: '#555',
                marginBottom: 8,
                marginLeft: 5,
        },
        filterScrollView: {
                marginBottom: 10,
        },
        filterButton: {
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: '#f0f0f0',
                marginRight: 10,
        },
        activeFilterButton: {
                backgroundColor: '#4CAF50',
        },
        filterButtonText: {
                fontSize: 14,
                color: '#555',
        },
        activeFilterButtonText: {
                color: '#fff',
                fontWeight: '500',
        },
        recommendationsList: {
                flex: 1,
        },
        recommendationCard: {
                borderRadius: 10,
                marginBottom: 15,
        },
        recommendationCardTitle: {
                fontSize: 18,
                color: '#4CAF50',
        },
        recommendationDescription: {
                fontSize: 16,
                color: '#555',
                lineHeight: 24,
                marginBottom: 15,
        },
        recommendationSection: {
                marginBottom: 15,
        },
        recommendationSectionTitle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#555',
                marginBottom: 8,
        },
        profileCard: {
                borderRadius: 10,
                marginBottom: 15,
        },
        profileHeader: {
                alignItems: 'center',
                paddingVertical: 20,
        },
        profileName: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#333',
                marginTop: 10,
        },
        profileInfo: {
                marginBottom: 20,
        },
        profileInfoRow: {
                flexDirection: 'row',
                marginBottom: 15,
                alignItems: 'flex-start',
        },
        profileInfoLabel: {
                width: '40%',
                fontSize: 16,
                color: '#666',
                fontWeight: '500',
        },
        profileInfoValue: {
                flex: 1,
                fontSize: 16,
                color: '#333',
        }, floatingMenuContainer: {
                position: 'absolute',
                bottom: 20,
                right: 20,
                alignItems: 'flex-end',
        },
        verticalMenu: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 20,
                marginBottom: 10,
                paddingVertical: 10,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
        },
        menuItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginVertical: 3,
                borderRadius: 20,
        },
        activeMenuItem: {
                backgroundColor: '#4CAF50',
        },
        menuItemText: {
                marginLeft: 10,
                fontSize: 16,
                color: '#4CAF50',
                fontWeight: '500',
        },
        activeMenuItemText: {
                color: '#fff',
        },
        menuToggleButton: {
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#4CAF50',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
        },
});

export default NutritionScreen