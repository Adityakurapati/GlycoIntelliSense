import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Card, Button, Input, Icon } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
        // Form state
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);
        const [loading, setLoading] = useState(false);
        const [errors, setErrors] = useState({});

        // Get auth context
        const { login } = useAuth();

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

                // Validate password
                if (!password) {
                        formErrors.password = "Password is required";
                        isValid = false;
                } else if (password.length < 6) {
                        formErrors.password = "Password must be at least 6 characters";
                        isValid = false;
                }

                setErrors(formErrors);
                return isValid;
        };

        // Handle login
        const handleLogin = async () => {
                if (!validateForm()) return;

                try {
                        setLoading(true);
                        await login(email, password);
                        // Navigation will be handled by the auth state change in AuthContext
                } catch (error) {
                        console.error("Login error:", error);
                        let errorMessage = "Failed to login. Please try again.";

                        if (error.code === "auth/user-not-found") {
                                errorMessage = "No account found with this email.";
                        } else if (error.code === "auth/wrong-password") {
                                errorMessage = "Incorrect password.";
                        } else if (error.code === "auth/invalid-credential") {
                                errorMessage = "Invalid email or password.";
                        } else if (error.code === "auth/too-many-requests") {
                                errorMessage = "Too many failed attempts. Please try again later.";
                        }

                        Alert.alert("Login Failed", errorMessage);
                } finally {
                        setLoading(false);
                }
        };

        // Handle forgot password
        const handleForgotPassword = () => {
                navigation.navigate("ForgotPassword");
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
                                                <Text style={styles.headerTitle}>Welcome Back</Text>
                                                <Text style={styles.headerSubtitle}>Sign in to continue</Text>
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

                                                <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                                                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                                </TouchableOpacity>

                                                <Button
                                                        title={loading ? "Signing In..." : "Sign In"}
                                                        onPress={handleLogin}
                                                        buttonStyle={styles.loginButton}
                                                        loading={loading}
                                                        disabled={loading}
                                                />

                                                <View style={styles.registerContainer}>
                                                        <Text style={styles.registerText}>Don't have an account?</Text>
                                                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                                                                <Text style={styles.registerLink}>Sign Up</Text>
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
                marginVertical: 30,
        },
        logo: {
                width: 120,
                height: 120,
                marginBottom: 20,
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
        forgotPasswordButton: {
                alignSelf: "flex-end",
                marginBottom: 20,
        },
        forgotPasswordText: {
                color: "#2089dc",
                fontSize: 14,
        },
        loginButton: {
                borderRadius: 25,
                paddingVertical: 12,
                backgroundColor: "#2089dc",
        },
        registerContainer: {
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
        },
        registerText: {
                color: "#666",
        },
        registerLink: {
                color: "#2089dc",
                fontWeight: "bold",
                marginLeft: 5,
        },
});