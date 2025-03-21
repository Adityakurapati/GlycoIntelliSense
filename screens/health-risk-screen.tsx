"use client"

import { useState } from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity } from "react-native"
import { Text, Card, Button, Icon, Divider } from "@rneui/themed"
import { SafeAreaView } from "react-native-safe-area-context"

import { colors } from "../constants/theme"

interface RiskFactor {
  id: string
  title: string
  description: string
  riskLevel: "low" | "medium" | "high"
  preventiveActions: string[]
  icon: string
}

const riskFactors: RiskFactor[] = [
  {
    id: "1",
    title: "Cardiovascular Disease",
    description:
      "People with diabetes are at higher risk for heart disease and stroke. High blood glucose from diabetes can damage blood vessels and the nerves that control the heart.",
    riskLevel: "high",
    preventiveActions: [
      "Maintain blood sugar levels within target range",
      "Control blood pressure and cholesterol",
      "Exercise regularly (at least 150 minutes per week)",
      "Eat a heart-healthy diet low in saturated fats",
      "Quit smoking if you smoke",
    ],
    icon: "heart",
  },
  {
    id: "2",
    title: "Diabetic Retinopathy",
    description:
      "Diabetic retinopathy is a diabetes complication that affects the eyes. It's caused by damage to the blood vessels in the retina and can lead to vision loss and blindness.",
    riskLevel: "medium",
    preventiveActions: [
      "Get a comprehensive dilated eye exam at least once a year",
      "Control blood sugar, blood pressure, and cholesterol",
      "Quit smoking if you smoke",
      "Report any changes in vision to your doctor immediately",
    ],
    icon: "eye",
  },
  {
    id: "3",
    title: "Diabetic Nephropathy",
    description:
      "Diabetic nephropathy is kidney damage that occurs in people with diabetes. It can lead to kidney failure if not managed properly.",
    riskLevel: "medium",
    preventiveActions: [
      "Control blood sugar and blood pressure",
      "Get regular urine tests to check for protein",
      "Limit protein intake if recommended by your doctor",
      "Avoid NSAIDs and other medications that can harm kidneys",
    ],
    icon: "filter",
  },
  {
    id: "4",
    title: "Diabetic Neuropathy",
    description:
      "Diabetic neuropathy is nerve damage caused by diabetes. It most often affects the legs and feet but can also affect other parts of the body.",
    riskLevel: "medium",
    preventiveActions: [
      "Control blood sugar levels",
      "Inspect feet daily for cuts, blisters, or swelling",
      "Wear proper footwear",
      "Exercise regularly as recommended by your doctor",
      "Avoid alcohol and smoking",
    ],
    icon: "zap",
  },
  {
    id: "5",
    title: "Hypoglycemia",
    description:
      "Hypoglycemia is a condition characterized by abnormally low blood glucose levels, usually less than 70 mg/dL. It can occur in people with diabetes who take insulin or certain oral diabetes medications.",
    riskLevel: "high",
    preventiveActions: [
      "Monitor blood sugar regularly",
      "Don't skip meals",
      "Adjust insulin doses as needed with physical activity",
      "Always carry fast-acting carbohydrates",
      "Wear a medical ID bracelet",
    ],
    icon: "trending-down",
  },
]

export default function HealthRiskScreen() {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)

  const toggleRiskExpansion = (id: string) => {
    if (expandedRisk === id) {
      setExpandedRisk(null)
    } else {
      setExpandedRisk(id)
    }
  }

  const getRiskLevelColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return colors.success
      case "medium":
        return colors.warning
      case "high":
        return colors.error
      default:
        return colors.info
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card containerStyle={styles.infoCard}>
          <Card.Title>Understanding Diabetes Health Risks</Card.Title>
          <Card.Divider />
          <Text style={styles.infoText}>
            Diabetes can affect many parts of your body and increase your risk for various health complications.
            Understanding these risks and taking preventive actions can help you maintain your health and prevent or
            delay the onset of complications.
          </Text>
          <Text style={styles.infoText}>
            Tap on each risk factor below to learn more about preventive measures you can take.
          </Text>
        </Card>

        {riskFactors.map((risk) => (
          <Card key={risk.id} containerStyle={styles.riskCard}>
            <TouchableOpacity onPress={() => toggleRiskExpansion(risk.id)}>
              <View style={styles.riskHeader}>
                <View style={styles.riskTitleContainer}>
                  <Icon name={risk.icon} type="feather" size={24} color={getRiskLevelColor(risk.riskLevel)} />
                  <Text style={styles.riskTitle}>{risk.title}</Text>
                </View>
                <View style={[styles.riskLevelBadge, { backgroundColor: getRiskLevelColor(risk.riskLevel) }]}>
                  <Text style={styles.riskLevelText}>
                    {risk.riskLevel.charAt(0).toUpperCase() + risk.riskLevel.slice(1)} Risk
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.riskDescription}>{risk.description}</Text>

            {expandedRisk === risk.id && (
              <View style={styles.preventiveActionsContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.preventiveActionsTitle}>Preventive Actions:</Text>
                {risk.preventiveActions.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <Icon name="check-circle" type="feather" size={16} color={colors.success} />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
                <Button
                  title="Learn More"
                  type="outline"
                  buttonStyle={styles.learnMoreButton}
                  containerStyle={styles.learnMoreButtonContainer}
                />
              </View>
            )}
          </Card>
        ))}

        <Card containerStyle={styles.assessmentCard}>
          <Card.Title>Take a Health Risk Assessment</Card.Title>
          <Card.Divider />
          <Text style={styles.assessmentText}>
            Complete a comprehensive health risk assessment to get personalized recommendations based on your specific
            health profile and diabetes management.
          </Text>
          <Button
            title="Start Assessment"
            icon={<Icon name="clipboard" type="feather" color="#ffffff" style={{ marginRight: 10 }} />}
            buttonStyle={styles.assessmentButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  infoCard: {
    borderRadius: 10,
    marginBottom: 15,
  },
  infoText: {
    marginBottom: 10,
    lineHeight: 20,
  },
  riskCard: {
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  riskTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  riskLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  riskLevelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  riskDescription: {
    marginBottom: 10,
    lineHeight: 20,
  },
  preventiveActionsContainer: {
    marginTop: 10,
  },
  preventiveActionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    marginLeft: 10,
    color: "#666",
  },
  divider: {
    marginVertical: 10,
  },
  learnMoreButton: {
    borderColor: colors.primary,
  },
  learnMoreButtonContainer: {
    marginTop: 15,
  },
  assessmentCard: {
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#f0f8ff",
  },
  assessmentText: {
    marginBottom: 15,
    lineHeight: 20,
  },
  assessmentButton: {
    backgroundColor: colors.primary,
  },
})

