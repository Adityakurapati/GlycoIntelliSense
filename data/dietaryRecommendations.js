// data/dietaryRecommendations.js
export const dietaryRecommendations=[
        {
                id: 1,
                title: "Increase Protein Intake",
                description: "Aim for 0.8-1g of protein per pound of body weight to support muscle growth and recovery.",
                benefits: [ "muscle building", "weight management", "satiety" ],
                foods: [ "chicken breast", "eggs", "greek yogurt", "tofu", "salmon", "lentils" ],
                suitableFor: [ "general", "vegetarian", "gluten-free", "dairy-free" ]
        },
        {
                id: 2,
                title: "Add More Leafy Greens",
                description: "Include at least 2 servings of leafy green vegetables daily for micronutrients and fiber.",
                benefits: [ "general health", "digestion", "weight management" ],
                foods: [ "spinach", "kale", "arugula", "collard greens", "swiss chard" ],
                suitableFor: [ "general", "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo" ]
        },
        {
                id: 3,
                title: "Incorporate Healthy Fats",
                description: "Include sources of omega-3 fatty acids and other healthy fats to support brain and heart health.",
                benefits: [ "brain health", "heart health", "hormone production" ],
                foods: [ "avocado", "olive oil", "nuts", "seeds", "fatty fish" ],
                suitableFor: [ "general", "vegetarian", "gluten-free", "dairy-free", "keto", "paleo" ]
        },
        {
                id: 4,
                title: "Include Complex Carbohydrates",
                description: "Choose whole grains and complex carbs for sustained energy and better blood sugar control.",
                benefits: [ "energy", "digestion", "blood sugar control" ],
                foods: [ "quinoa", "brown rice", "sweet potatoes", "oats", "whole grain bread" ],
                suitableFor: [ "general", "vegetarian", "vegan", "dairy-free" ]
        },
        {
                id: 5,
                title: "Stay Hydrated",
                description: "Drink at least 8 glasses of water daily, more if physically active or in hot weather.",
                benefits: [ "energy", "digestion", "skin health", "general health" ],
                foods: [ "water", "herbal tea", "infused water" ],
                suitableFor: [ "general", "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo" ]
        },
        {
                id: 6,
                title: "Limit Processed Foods",
                description: "Reduce intake of packaged and processed foods high in refined sugars, unhealthy fats, and additives.",
                benefits: [ "weight management", "heart health", "energy", "general health" ],
                avoidFoods: [ "fast food", "packaged snacks", "sugary beverages", "processed meats" ],
                suitableFor: [ "general", "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo" ]
        },
        {
                id: 7,
                title: "Eat More Berries and Fruits",
                description: "Incorporate antioxidant-rich berries and colorful fruits for vitamins and phytonutrients.",
                benefits: [ "immune support", "skin health", "anti-aging", "general health" ],
                foods: [ "blueberries", "strawberries", "raspberries", "apples", "oranges" ],
                suitableFor: [ "general", "vegetarian", "vegan", "gluten-free", "dairy-free", "paleo" ]
        },
        {
                id: 8,
                title: "Include Probiotic Foods",
                description: "Support gut health with fermented foods containing beneficial bacteria.",
                benefits: [ "gut health", "immune support", "digestion" ],
                foods: [ "yogurt", "kefir", "sauerkraut", "kimchi", "kombucha", "tempeh" ],
                suitableFor: [ "general", "vegetarian", "gluten-free" ]
        },
        {
                id: 9,
                title: "Time Your Meals",
                description: "Distribute protein and other nutrients evenly throughout the day for optimal metabolism and energy.",
                benefits: [ "energy", "muscle building", "weight management" ],
                strategy: "Eat every 3-4 hours with balanced macronutrients",
                suitableFor: [ "general", "vegetarian", "vegan", "gluten-free", "dairy-free", "paleo" ]
        },
        {
                id: 10,
                title: "Increase Fiber Intake",
                description: "Aim for 25-35g of fiber daily for digestive health and sustained energy.",
                benefits: [ "digestion", "heart health", "weight management", "blood sugar control" ],
                foods: [ "legumes", "whole grains", "fruits", "vegetables", "nuts", "seeds" ],
                suitableFor: [ "general", "vegetarian", "vegan", "dairy-free" ]
        },
        {
                id: 11,
                title: "Moderate Carb Intake",
                description: "Focus on timing carbohydrates around workouts for improved performance and recovery.",
                benefits: [ "energy", "muscle building", "weight management" ],
                foods: [ "oats", "sweet potatoes", "fruit", "rice" ],
                suitableFor: [ "general", "vegetarian", "vegan", "gluten-free", "dairy-free" ]
        },
        {
                id: 12,
                title: "Add Plant-Based Protein",
                description: "Incorporate more plant proteins for fiber, nutrients, and environmental sustainability.",
                benefits: [ "heart health", "general health", "digestion" ],
                foods: [ "lentils", "chickpeas", "black beans", "tofu", "tempeh", "quinoa" ],
                suitableFor: [ "general", "vegetarian", "vegan", "gluten-free", "dairy-free" ]
        },
        {
                id: 13,
                title: "Pre-Workout Nutrition",
                description: "Consume carbs and protein 1-2 hours before exercise for optimal performance.",
                benefits: [ "energy", "muscle building", "performance" ],
                foods: [ "banana with nut butter", "oatmeal with protein", "greek yogurt with fruit" ],
                suitableFor: [ "general", "vegetarian", "gluten-free" ]
        },
        {
                id: 14,
                title: "Post-Workout Recovery",
                description: "Consume 20-30g protein and fast-digesting carbs within 30-60 minutes after training.",
                benefits: [ "muscle recovery", "muscle building", "energy restoration" ],
                foods: [ "protein shake with banana", "chicken and rice", "greek yogurt with berries" ],
                suitableFor: [ "general", "vegetarian", "gluten-free" ]
        },
        {
                id: 15,
                title: "Anti-Inflammatory Focus",
                description: "Emphasize foods that reduce inflammation and support recovery.",
                benefits: [ "joint health", "heart health", "general health", "recovery" ],
                foods: [ "fatty fish", "turmeric", "ginger", "berries", "leafy greens", "nuts" ],
                suitableFor: [ "general", "vegetarian", "gluten-free", "dairy-free", "keto", "paleo" ]
        }
];

// Sample meal plans based on different goals
export const sampleMealPlans={
        weightLoss: [
                {
                        day: "Monday",
                        meals: [
                                {
                                        type: "Breakfast",
                                        food: "Greek yogurt with berries and a tablespoon of honey",
                                        calories: 240,
                                        protein: 20,
                                        carbs: 30,
                                        fat: 5
                                },
                                {
                                        type: "Lunch",
                                        food: "Grilled chicken salad with olive oil dressing",
                                        calories: 350,
                                        protein: 35,
                                        carbs: 15,
                                        fat: 15
                                },
                                {
                                        type: "Dinner",
                                        food: "Baked salmon with steamed broccoli and quinoa",
                                        calories: 420,
                                        protein: 35,
                                        carbs: 30,
                                        fat: 15
                                },
                                {
                                        type: "Snack",
                                        food: "Apple with a tablespoon of almond butter",
                                        calories: 160,
                                        protein: 4,
                                        carbs: 20,
                                        fat: 8
                                }
                        ]
                }
                // Additional days would be added here
        ],

        muscleGain: [
                {
                        day: "Monday",
                        meals: [
                                {
                                        type: "Breakfast",
                                        food: "Oatmeal with protein powder, banana, and almond butter",
                                        calories: 450,
                                        protein: 30,
                                        carbs: 50,
                                        fat: 12
                                },
                                {
                                        type: "Lunch",
                                        food: "Chicken breast with brown rice and mixed vegetables",
                                        calories: 550,
                                        protein: 40,
                                        carbs: 60,
                                        fat: 10
                                },
                                {
                                        type: "Dinner",
                                        food: "Lean beef steak with sweet potato and asparagus",
                                        calories: 600,
                                        protein: 45,
                                        carbs: 45,
                                        fat: 20
                                },
                                {
                                        type: "Snack 1",
                                        food: "Protein shake with banana",
                                        calories: 280,
                                        protein: 25,
                                        carbs: 30,
                                        fat: 3
                                },
                                {
                                        type: "Snack 2",
                                        food: "Greek yogurt with berries and honey",
                                        calories: 240,
                                        protein: 20,
                                        carbs: 30,
                                        fat: 5
                                }
                        ]
                }
                // Additional days would be added here
        ],

        energyBoost: [
                {
                        day: "Monday",
                        meals: [
                                {
                                        type: "Breakfast",
                                        food: "Whole grain toast with avocado and eggs",
                                        calories: 380,
                                        protein: 18,
                                        carbs: 30,
                                        fat: 20
                                },
                                {
                                        type: "Lunch",
                                        food: "Quinoa bowl with mixed vegetables and tofu",
                                        calories: 420,
                                        protein: 20,
                                        carbs: 55,
                                        fat: 12
                                },
                                {
                                        type: "Dinner",
                                        food: "Grilled fish with roasted vegetables and sweet potato",
                                        calories: 450,
                                        protein: 30,
                                        carbs: 40,
                                        fat: 15
                                },
                                {
                                        type: "Snack 1",
                                        food: "Trail mix with nuts and dried fruit",
                                        calories: 200,
                                        protein: 6,
                                        carbs: 20,
                                        fat: 12
                                },
                                {
                                        type: "Snack 2",
                                        food: "Green smoothie with spinach, banana, and almond milk",
                                        calories: 180,
                                        protein: 4,
                                        carbs: 35,
                                        fat: 3
                                }
                        ]
                }
                // Additional days would be added here
        ]
};