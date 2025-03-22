import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Card, Button, Input, Icon } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordScreen({ navigation }) {
        // Form state
        const [email, setEmail] = useState("");
        const [loading, setLoading] = useState(false);
        const [errors, setErrors] = useState({});

        // Get auth context
        const { resetPassword } = useAuth();

        // Validate form
        const validateForm = () => {
                let formErrors = {};
                let isValid = true;

                // Validate email
                if (!email) {
                        formErrors.email = "Email is required";
                        isValid = false;
                } else if (!/\S+@\S+\.\S+/.test(email)) {
                        formErrors.email = "Email is invalid";
                        isValid = false;
                }

                setErrors(formErrors);
                return isValid;
        };

        // Handle password reset
        const handleResetPassword = async () => {
                if (!validateForm()) return;

                try {
                        setLoading(true);
                        await resetPassword(email);
                        Alert.alert(
                                "Reset Email Sent",
                                "Check your email for instructions to reset your password.",
                                [
                                        {
                                                text: "OK",
                                                onPress: () => navigation.navigate("Login")
                                        }
                                ]
                        );
                } catch (error) {
                        console.error("Password reset error:", error);
                        let errorMessage = "Failed to send reset email. Please try again.";

                        if (error.code === "auth/user-not-found") {
                                errorMessage = "No account found with this email.";
                        } else if (error.code === "auth/invalid-email") {
                                errorMessage = "Please provide a valid email address.";
                        }

                        Alert.alert("Reset Failed", errorMessage);
                } finally {
                        setLoading(false);
                }
        };

        return (
                <SafeAreaView style={styles.container}>
                        <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                style={styles.keyboardAvoidingView}
                        >
                                <ScrollView contentContainerStyle={styles.scrollView}>
                                        <View style={styles.headerContainer}>
                                                <Icon
                                                        name="lock"
                                                        type="feather"
                                                        size={60}
                                                        color="#2089dc"
                                                        containerStyle={styles.iconContainer}
                                                />
                                                <Text style={styles.headerTitle}>Forgot Password?</Text>
                                                <Text style={styles.headerSubtitle}>
                                                        Enter your email and we'll send you a link to reset your password
                                                </Text>
                                        </View>

                                        <Card containerStyle={styles.card}>
                                                <Input
                                                        label="Email"
                                                        placeholder="Enter your email"
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        value={email}
                                                        onChangeText={setEmail}
                                                        leftIcon={<Icon name="mail" type="feather" size={20} color="#86939e" />}
                                                        errorMessage={errors.email}
                                                        disabled={loading}
                                                        autoCorrect={false}
                                                />

                                                <Button
                                                        title={loading ? "Sending..." : "Send Reset Link"}
                                                        onPress={handleResetPassword}
                                                        buttonStyle={styles.resetButton}
                                                        loading={loading}
                                                        disabled={loading}
                                                />

                                                <TouchableOpacity
                                                        style={styles.backButton}
                                                        onPress={() => navigation.navigate("Login")}
                                                >
                                                        <Icon name="arrow-left" type="feather" size={16} color="#2089dc" />
                                                        <Text style={styles.backText}>Back to Login</Text>
                                                </TouchableOpacity>
                                        </Card>
                                </ScrollView>
                        </KeyboardAvoidingView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: "#f8f9fa",
        },
        keyboardAvoidingView: {
                flex: 1,
        },
        scrollView: {
                flexGrow: 1,
                justifyContent: "center",
        },
        headerContainer: {
                alignItems: "center",
                marginVertical: 30,
                paddingHorizontal: 30,
        },
        iconContainer: {
                backgroundColor: "#e6f2ff",
                borderRadius: 50,
                width: 100,
                height: 100,
                justifyContent: "center",
                marginBottom: 20,
        },
        headerTitle: {
                fontSize: 28,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#333",
                textAlign: "center",
        },
        headerSubtitle: {
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                marginBottom: 10,
        },
        card: {
                borderRadius: 10,
                marginHorizontal: 20,
                marginBottom: 20,
                padding: 15,
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
        },
        resetButton: {
                borderRadius: 25,
                paddingVertical: 12,
                backgroundColor: "#2089dc",
                marginTop: 10,
        },
        backButton: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
        },
        backText: {
                color: "#2089dc",
                marginLeft: 5,
                fontSize: 16,
        },
});