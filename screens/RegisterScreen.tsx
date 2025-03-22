import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Card, Button, Input, Icon } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
        // Form state
        const [name, setName] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [loading, setLoading] = useState(false);
        const [errors, setErrors] = useState({});

        // Get auth context
        const { register } = useAuth();

        // Validate form
        const validateForm = () => {
                let formErrors = {};
                let isValid = true;

                // Validate name
                if (!name) {
                        formErrors.name = "Name is required";
                        isValid = false;
                }

                // Validate email
                if (!email) {
                        formErrors.email = "Email is required";
                        isValid = false;
                } else if (!/\S+@\S+\.\S+/.test(email)) {
                        formErrors.email = "Email is invalid";
                        isValid = false;
                }

                // Validate password
                if (!password) {
                        formErrors.password = "Password is required";
                        isValid = false;
                } else if (password.length < 6) {
                        formErrors.password = "Password must be at least 6 characters";
                        isValid = false;
                }

                // Validate confirm password
                if (!confirmPassword) {
                        formErrors.confirmPassword = "Please confirm your password";
                        isValid = false;
                } else if (password !== confirmPassword) {
                        formErrors.confirmPassword = "Passwords do not match";
                        isValid = false;
                }

                setErrors(formErrors);
                return isValid;
        };

        // Handle registration
        const handleRegister = async () => {
                if (!validateForm()) return;

                try {
                        setLoading(true);
                        await register(email, password, name);
                        Alert.alert(
                                "Registration Successful",
                                "Your account has been created successfully. You are now logged in.",
                                [{ text: "OK" }]
                        );
                        // Navigation will be handled by the auth state change in AuthContext
                } catch (error) {
                        console.error("Registration error:", error);
                        let errorMessage = "Failed to create account. Please try again.";

                        if (error.code === "auth/email-already-in-use") {
                                errorMessage = "This email is already in use by another account.";
                        } else if (error.code === "auth/invalid-email") {
                                errorMessage = "Please provide a valid email address.";
                        } else if (error.code === "auth/weak-password") {
                                errorMessage = "Password is too weak. Please choose a stronger password.";
                        }

                        Alert.alert("Registration Failed", errorMessage);
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
                                                <Image
                                                        source={require('../assets/logo.png')}
                                                        style={styles.logo}
                                                        resizeMode="contain"
                                                />
                                                <Text style={styles.headerTitle}>Create Account</Text>
                                                <Text style={styles.headerSubtitle}>Sign up to get started</Text>
                                        </View>

                                        <Card containerStyle={styles.card}>
                                                <Input
                                                        label="Full Name"
                                                        placeholder="Enter your full name"
                                                        value={name}
                                                        onChangeText={setName}
                                                        leftIcon={<Icon name="user" type="feather" size={20} color="#86939e" />}
                                                        errorMessage={errors.name}
                                                        disabled={loading}
                                                        autoCorrect={false}
                                                />

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

                                                <Input
                                                        label="Password"
                                                        placeholder="Enter your password"
                                                        secureTextEntry={!showPassword}
                                                        value={password}
                                                        onChangeText={setPassword}
                                                        leftIcon={<Icon name="lock" type="feather" size={20} color="#86939e" />}
                                                        rightIcon={
                                                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                                        <Icon name={showPassword ? "eye-off" : "eye"} type="feather" size={20} color="#86939e" />
                                                                </TouchableOpacity>
                                                        }
                                                        errorMessage={errors.password}
                                                        disabled={loading}
                                                />

                                                <Input
                                                        label="Confirm Password"
                                                        placeholder="Confirm your password"
                                                        secureTextEntry={!showConfirmPassword}
                                                        value={confirmPassword}
                                                        onChangeText={setConfirmPassword}
                                                        leftIcon={<Icon name="lock" type="feather" size={20} color="#86939e" />}
                                                        rightIcon={
                                                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                        <Icon name={showConfirmPassword ? "eye-off" : "eye"} type="feather" size={20} color="#86939e" />
                                                                </TouchableOpacity>
                                                        }
                                                        errorMessage={errors.confirmPassword}
                                                        disabled={loading}
                                                />

                                                <Button
                                                        title={loading ? "Creating Account..." : "Create Account"}
                                                        onPress={handleRegister}
                                                        buttonStyle={styles.registerButton}
                                                        loading={loading}
                                                        disabled={loading}
                                                />

                                                <View style={styles.loginContainer}>
                                                        <Text style={styles.loginText}>Already have an account?</Text>
                                                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                                                <Text style={styles.loginLink}>Sign In</Text>
                                                        </TouchableOpacity>
                                                </View>
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
                marginVertical: 20,
        },
        logo: {
                width: 100,
                height: 100,
                marginBottom: 15,
        },
        headerTitle: {
                fontSize: 28,
                fontWeight: "bold",
                marginBottom: 5,
                color: "#333",
        },
        headerSubtitle: {
                fontSize: 16,
                color: "#666",
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
        registerButton: {
                borderRadius: 25,
                paddingVertical: 12,
                backgroundColor: "#2089dc",
        },
        loginContainer: {
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
        },
        loginText: {
                color: "#666",
        },
        loginLink: {
                color: "#2089dc",
                fontWeight: "bold",
                marginLeft: 5,
        },
});