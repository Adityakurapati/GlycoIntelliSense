import { createTheme } from "@rneui/themed"

// Custom theme for the app
export const theme = createTheme({
  lightColors: {
    primary: "#6A5ACD", // SlateBlue - a purple shade good for health apps
    secondary: "#FF7F50", // Coral - complementary to purple
    background: "#F8F9FA",
    white: "#FFFFFF",
    black: "#000000",
    grey0: "#F8F9FA",
    grey1: "#E9ECEF",
    grey2: "#DEE2E6",
    grey3: "#CED4DA",
    grey4: "#ADB5BD",
    grey5: "#6C757D",
    success: "#28A745",
    warning: "#FFC107",
    error: "#DC3545",
    info: "#17A2B8",
  },
  darkColors: {
    primary: "#7B68EE", // MediumSlateBlue - lighter for dark mode
    secondary: "#FF8C69", // Salmon - lighter for dark mode
    background: "#121212",
    white: "#FFFFFF",
    black: "#000000",
    grey0: "#212529",
    grey1: "#343A40",
    grey2: "#495057",
    grey3: "#6C757D",
    grey4: "#ADB5BD",
    grey5: "#CED4DA",
    success: "#28A745",
    warning: "#FFC107",
    error: "#DC3545",
    info: "#17A2B8",
  },
  mode: "light",
  components: {
    Button: {
      raised: true,
      borderRadius: 10,
    },
    Card: {
      borderRadius: 10,
      padding: 15,
    },
  },
})

// App color palette
export const colors = {
  bloodSugar: "#FF7F50", // Coral for blood sugar related items
  steps: "#6A5ACD", // SlateBlue for step counter
  sleep: "#9370DB", // MediumPurple for sleep tracking
  medication: "#20B2AA", // LightSeaGreen for medication
  appointment: "#FF6347", // Tomato for appointments
  risk: "#DC3545", // Danger red for risk assessment
  progress: "#28A745", // Success green for progress
  nutrition: "#FF8C00", // DarkOrange for nutrition
}

