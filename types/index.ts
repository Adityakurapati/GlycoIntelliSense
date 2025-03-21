// Blood sugar reading
export interface BloodSugarReading {
  id: string
  value: number // in mg/dL
  timestamp: Date
  mealStatus: "before" | "after" | "fasting"
  notes?: string
}

// Health goal
export interface Goal {
  id: string
  type: "steps" | "sleep" | "bloodSugar" | "weight" | "custom"
  target: number
  unit: string
  startDate: Date
  endDate?: Date
  progress: number
  completed: boolean
}

// Appointment
export interface Appointment {
  id: string
  labId: string
  labName: string
  testType: string
  date: Date
  status: "scheduled" | "completed" | "cancelled"
  homeCollection: boolean
  address?: string
  results?: {
    url: string
    date: Date
  }
}

// Medication
export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date
  timeOfDay: string[]
  notes?: string
}

// Reminder
export interface Reminder {
  id: string
  type: "medication" | "checkup" | "bloodSugar" | "custom"
  title: string
  description?: string
  date: Date
  recurring: boolean
  recurrencePattern?: string
  completed: boolean
}

// User profile
export interface UserProfile {
  id: string
  name: string
  age: number
  gender: string
  height: number // in cm
  weight: number // in kg
  diabetesType: "type1" | "type2" | "gestational" | "prediabetes" | "other"
  diagnosisDate?: Date
  targetBloodSugarRange: {
    min: number
    max: number
  }
  dietaryPreferences?: string[]
  allergies?: string[]
}

// Lab
export interface Lab {
  id: string
  name: string
  address: string
  phone: string
  email: string
  services: string[]
  homeCollection: boolean
  operatingHours: {
    day: string
    open: string
    close: string
  }[]
}

// Nutrition
export interface MealPlan {
  id: string
  date: Date
  meals: Meal[]
}

export interface Meal {
  id: string
  type: "breakfast" | "lunch" | "dinner" | "snack"
  foods: Food[]
  totalCalories: number
  totalCarbs: number
  totalProtein: number
  totalFat: number
  glycemicIndex: number
}

export interface Food {
  id: string
  name: string
  portion: string
  calories: number
  carbs: number
  protein: number
  fat: number
  glycemicIndex: number
}

