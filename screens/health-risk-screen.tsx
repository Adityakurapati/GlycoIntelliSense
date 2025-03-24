"use client"

import { useState, useEffect } from "react"
import { ref, get, push, set, query, orderByChild } from "firebase/database"
import { db } from "../config/firebase"
import {
        View,
        Text,
        TextInput,
        ScrollView,
        StyleSheet,
        TouchableOpacity,
        Image,
        ActivityIndicator,
        Alert,
        KeyboardAvoidingView,
        Platform,
        SafeAreaView,
} from "react-native"

const DB_PATH = "healthRiskArticles"

const HealthRiskScreen = () => {
        // State variables
        const [articles, setArticles] = useState([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)
        const [showForm, setShowForm] = useState(false)
        const [selectedArticle, setSelectedArticle] = useState(null)
        const [formData, setFormData] = useState({
                title: "",
                summary: "",
                content: "",
                riskLevel: "medium",
                category: "",
                tags: "",
                imageUrl: "",
        })
        const [isSubmitting, setIsSubmitting] = useState(false)

        // Fetch articles on component mount
        useEffect(() => {
                fetchArticles()
        }, [])

        // Fetch all articles from Firebase Realtime Database
        const fetchArticles = async () => {
                try {
                        setLoading(true)
                        const articlesRef = query(ref(db, DB_PATH), orderByChild("createdAt"))

                        const snapshot = await get(articlesRef)

                        if (snapshot.exists()) {
                                const articlesData = snapshot.val()

                                // Convert object to array and sort by createdAt descending
                                const fetchedArticles = Object.entries(articlesData)
                                        .map(([id, data]) => ({
                                                id,
                                                ...data,
                                        }))
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

                                setArticles(fetchedArticles)
                        } else {
                                // No articles exist yet
                                setArticles([])
                        }

                        setError(null)
                } catch (err) {
                        setError("Failed to fetch health risk articles")
                        console.error("Error fetching articles:", err)
                } finally {
                        setLoading(false)
                }
        }

        // Fetch a single article by ID
        const fetchArticleById = async (id) => {
                try {
                        setLoading(true)
                        const articleRef = ref(db, `${DB_PATH}/${id}`)
                        const snapshot = await get(articleRef)

                        if (snapshot.exists()) {
                                setSelectedArticle({
                                        id: id,
                                        ...snapshot.val(),
                                })
                        } else {
                                setError(`Article with ID ${id} not found`)
                        }
                } catch (err) {
                        setError("Failed to fetch article details")
                        console.error("Error fetching article:", err)
                } finally {
                        setLoading(false)
                }
        }

        // Handle form input changes
        const handleChange = (name, value) => {
                setFormData((prevData) => ({
                        ...prevData,
                        [name]: value,
                }))
        }

        // Handle form submission
        const handleSubmit = async () => {
                // Validate form
                if (!formData.title || !formData.content || !formData.category) {
                        Alert.alert("Error", "Please fill out all required fields")
                        return
                }

                setIsSubmitting(true)

                try {
                        // Process tags from comma-separated string to array
                        const processedData = {
                                ...formData,
                                tags: formData.tags
                                        ? formData.tags
                                                .split(",")
                                                .map((tag) => tag.trim())
                                                .filter((tag) => tag)
                                        : [],
                                createdAt: new Date().toISOString(),
                                imageUrl: formData.imageUrl || "https://via.placeholder.com/150",
                        }

                        // Add to Firebase Realtime Database
                        const newArticleRef = push(ref(db, DB_PATH))
                        await set(newArticleRef, processedData)

                        // Update the local state with the new article
                        setArticles([{ id: newArticleRef.key, ...processedData }, ...articles])

                        // Reset form after successful submission
                        setFormData({
                                title: "",
                                summary: "",
                                content: "",
                                riskLevel: "medium",
                                category: "",
                                tags: "",
                                imageUrl: "",
                        })

                        setShowForm(false)
                        setError(null)

                        Alert.alert("Success", "Article added successfully!")
                } catch (err) {
                        setError("Failed to add new article")
                        console.error("Error adding article:", err)
                } finally {
                        setIsSubmitting(false)
                }
        }

        // View an article in detail
        const viewArticle = (article) => {
                setSelectedArticle(article)
        }

        // Go back to article list
        const backToList = () => {
                setSelectedArticle(null)
        }

        // Format date for display
        const formatDate = (timestamp) => {
                if (!timestamp) return "Unknown date"

                const date = new Date(timestamp)
                return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                })
        }

        // Get color based on risk level
        const getRiskLevelColor = (level) => {
                switch (level?.toLowerCase()) {
                        case "low":
                                return styles.lowRisk
                        case "medium":
                                return styles.mediumRisk
                        case "high":
                                return styles.highRisk
                        case "critical":
                                return styles.criticalRisk
                        default:
                                return styles.defaultRisk
                }
        }

        // Truncate text for card view
        const truncateText = (text, maxLength = 120) => {
                if (!text) return ""
                return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
        }

        // Render the article form
        const renderArticleForm = () => (
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
                        <ScrollView
                                style={styles.formContainer}
                                contentContainerStyle={styles.formContentContainer}
                                showsVerticalScrollIndicator={true}
                        >
                                <Text style={styles.formTitle}>Add New Health Risk Article</Text>
                                <Text style={styles.label}>Title *</Text>
                                <TextInput
                                        style={styles.input}
                                        value={formData.title}
                                        onChangeText={(text) => handleChange("title", text)}
                                        placeholder="Title"
                                        required
                                />

                                <Text style={styles.label}>Summary</Text>
                                <TextInput
                                        style={styles.input}
                                        value={formData.summary}
                                        onChangeText={(text) => handleChange("summary", text)}
                                        placeholder="Summary"
                                />

                                <Text style={styles.label}>Content *</Text>
                                <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={formData.content}
                                        onChangeText={(text) => handleChange("content", text)}
                                        placeholder="Content"
                                        multiline
                                        numberOfLines={6}
                                        required
                                />

                                <Text style={styles.label}>Risk Level</Text>
                                <View style={styles.riskSelector}>
                                        <TouchableOpacity
                                                style={[
                                                        styles.riskOption,
                                                        styles.riskOptionLow,
                                                        formData.riskLevel === "low" && styles.riskOptionLowSelected,
                                                ]}
                                                onPress={() => handleChange("riskLevel", "low")}
                                        >
                                                <Text style={[styles.riskOptionText, formData.riskLevel === "low" && { color: COLORS.white }]}>Low</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={[
                                                        styles.riskOption,
                                                        styles.riskOptionMedium,
                                                        formData.riskLevel === "medium" && styles.riskOptionMediumSelected,
                                                ]}
                                                onPress={() => handleChange("riskLevel", "medium")}
                                        >
                                                <Text style={[styles.riskOptionText, formData.riskLevel === "medium" && { color: COLORS.white }]}>
                                                        Medium
                                                </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={[
                                                        styles.riskOption,
                                                        styles.riskOptionHigh,
                                                        formData.riskLevel === "high" && styles.riskOptionHighSelected,
                                                ]}
                                                onPress={() => handleChange("riskLevel", "high")}
                                        >
                                                <Text style={[styles.riskOptionText, formData.riskLevel === "high" && { color: COLORS.white }]}>High</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={[
                                                        styles.riskOption,
                                                        styles.riskOptionCritical,
                                                        formData.riskLevel === "critical" && styles.riskOptionCriticalSelected,
                                                ]}
                                                onPress={() => handleChange("riskLevel", "critical")}
                                        >
                                                <Text style={[styles.riskOptionText, formData.riskLevel === "critical" && { color: COLORS.white }]}>
                                                        Critical
                                                </Text>
                                        </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>Category *</Text>
                                <TextInput
                                        style={styles.input}
                                        value={formData.category}
                                        onChangeText={(text) => handleChange("category", text)}
                                        placeholder="Category"
                                        required
                                />

                                <Text style={styles.label}>Tags (comma separated)</Text>
                                <TextInput
                                        style={styles.input}
                                        value={formData.tags}
                                        onChangeText={(text) => handleChange("tags", text)}
                                        placeholder="e.g. diabetes, heart, prevention"
                                />

                                <Text style={styles.label}>Image URL</Text>
                                <TextInput
                                        style={styles.input}
                                        value={formData.imageUrl}
                                        onChangeText={(text) => handleChange("imageUrl", text)}
                                        placeholder="https://example.com/image.jpg"
                                />

                                <View style={styles.formButtonsContainer}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                                                onPress={handleSubmit}
                                                disabled={isSubmitting}
                                        >
                                                <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit Article"}</Text>
                                        </TouchableOpacity>
                                </View>

                                {/* Extra space at the bottom to ensure form is fully visible */}
                                <View style={styles.formBottomSpacer} />
                        </ScrollView>
                </KeyboardAvoidingView>
        )

        // Render an article card
        const renderArticleCard = (article) => (
                <TouchableOpacity key={article.id} style={styles.card} onPress={() => viewArticle(article)}>
                        <View style={styles.cardImageContainer}>
                                {article.imageUrl && (
                                        <Image
                                                source={{ uri: article.imageUrl }}
                                                style={styles.cardImage}
                                                onError={(e) => {
                                                        e.target.onerror = null
                                                        e.target.src = "https://via.placeholder.com/150"
                                                }}
                                        />
                                )}
                        </View>

                        <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{article.title}</Text>
                                        {article.riskLevel && (
                                                <View style={[styles.riskLevel, getRiskLevelColor(article.riskLevel)]}>
                                                        <Text style={[styles.riskText, getRiskLevelColor(article.riskLevel + "Text")]}>
                                                                {article.riskLevel.charAt(0).toUpperCase() + article.riskLevel.slice(1)} Risk
                                                        </Text>
                                                </View>
                                        )}
                                </View>

                                <Text style={styles.cardDate}>{formatDate(article.createdAt)}</Text>

                                {article.summary && <Text style={styles.cardSummary}>{truncateText(article.summary)}</Text>}

                                {!article.summary && article.content && <Text style={styles.cardSummary}>{truncateText(article.content)}</Text>}

                                <View style={styles.metadataContainer}>
                                        {article.category && (
                                                <View style={styles.categoryContainer}>
                                                        <Text style={styles.category}>{article.category}</Text>
                                                </View>
                                        )}

                                        {article.tags &&
                                                article.tags.length > 0 &&
                                                article.tags.map((tag, index) => (
                                                        <Text key={index} style={styles.tag}>
                                                                #{tag}
                                                        </Text>
                                                ))}
                                </View>

                                <View style={styles.readMoreContainer}>
                                        <Text style={styles.readMore}>Read more</Text>
                                </View>
                        </View>
                </TouchableOpacity>
        )

        // Render article detail view
        const renderArticleDetail = () => (
                <SafeAreaView style={styles.safeArea}>
                        <ScrollView style={styles.detailContainer} contentContainerStyle={styles.detailContentScrollContainer}>
                                <TouchableOpacity onPress={backToList} style={styles.backButton}>
                                        <Text style={styles.backButtonText}>← Back to Articles</Text>
                                </TouchableOpacity>

                                <View style={styles.detailContent}>
                                        {selectedArticle.imageUrl && (
                                                <Image
                                                        source={{ uri: selectedArticle.imageUrl }}
                                                        style={styles.detailImage}
                                                        onError={(e) => {
                                                                e.target.onerror = null
                                                                e.target.src = "https://via.placeholder.com/150"
                                                        }}
                                                />
                                        )}

                                        <View style={styles.detailHeader}>
                                                <Text style={styles.detailTitle}>{selectedArticle.title}</Text>
                                                {selectedArticle.riskLevel && (
                                                        <View style={[styles.detailRiskLevel, getRiskLevelColor(selectedArticle.riskLevel)]}>
                                                                <Text style={[styles.riskText, getRiskLevelColor(selectedArticle.riskLevel + "Text")]}>
                                                                        {selectedArticle.riskLevel.charAt(0).toUpperCase() + selectedArticle.riskLevel.slice(1)} Risk
                                                                </Text>
                                                        </View>
                                                )}
                                        </View>

                                        <Text style={styles.detailDate}>{formatDate(selectedArticle.createdAt)}</Text>

                                        {selectedArticle.summary && (
                                                <View style={styles.detailSummaryContainer}>
                                                        <Text style={styles.detailSummaryTitle}>Summary</Text>
                                                        <Text style={styles.detailSummary}>{selectedArticle.summary}</Text>
                                                </View>
                                        )}

                                        <View style={styles.detailContentContainer}>
                                                {selectedArticle.content.split("\n").map((paragraph, index) => (
                                                        <Text key={index} style={styles.detailContentParagraph}>
                                                                {paragraph}
                                                        </Text>
                                                ))}
                                        </View>

                                        <View style={styles.detailTagsSection}>
                                                <Text style={styles.detailTagsTitle}>Tags & Categories</Text>
                                                <View style={styles.metadataContainer}>
                                                        {selectedArticle.category && (
                                                                <View style={styles.categoryContainer}>
                                                                        <Text style={styles.category}>{selectedArticle.category}</Text>
                                                                </View>
                                                        )}

                                                        {selectedArticle.tags &&
                                                                selectedArticle.tags.length > 0 &&
                                                                selectedArticle.tags.map((tag, index) => (
                                                                        <Text key={index} style={styles.tag}>
                                                                                #{tag}
                                                                        </Text>
                                                                ))}
                                                </View>
                                        </View>
                                </View>

                                {/* Extra space at the bottom */}
                                <View style={styles.bottomSpacer} />
                        </ScrollView>
                </SafeAreaView>
        )

        // Render the article list
        const renderArticleList = () => (
                <SafeAreaView style={styles.safeArea}>
                        <View style={styles.listContainer}>
                                <View style={styles.header}>
                                        <Text style={styles.headerTitle}>Articles</Text>
                                        <TouchableOpacity
                                                style={styles.headerButton}
                                                onPress={() => {
                                                        setShowForm(!showForm)
                                                        console.log("Toggle form visibility:", !showForm) // Add logging to debug
                                                }}
                                        >
                                                <Text style={styles.headerButtonText}>{showForm ? "Cancel" : "Add New Article"}</Text>
                                        </TouchableOpacity>
                                </View>

                                {error && (
                                        <View style={styles.errorContainer}>
                                                <Text style={styles.errorText}>{error}</Text>
                                        </View>
                                )}

                                {showForm ? (
                                        renderArticleForm()
                                ) : loading ? (
                                        <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="large" color={COLORS.primary} />
                                        </View>
                                ) : (
                                        <ScrollView contentContainerStyle={styles.articleListContent} showsVerticalScrollIndicator={true}>
                                                {articles.length > 0 ? (
                                                        articles.map((article) => renderArticleCard(article))
                                                ) : (
                                                        <View style={styles.noArticlesContainer}>
                                                                <Text style={styles.noArticlesText}>No health risk articles found. Be the first to add one!</Text>
                                                        </View>
                                                )}
                                                <View style={styles.bottomSpacer} />
                                        </ScrollView>
                                )}
                        </View>
                </SafeAreaView>
        )

        // Main render logic
        return <View style={styles.container}>{selectedArticle ? renderArticleDetail() : renderArticleList()}</View>
}

const COLORS = {
        primary: "#2563EB", // Vibrant blue
        primaryLight: "#DBEAFE",
        secondary: "#7C3AED", // Purple for accents
        background: "#F9FAFB",
        white: "#FFFFFF",
        dark: "#111827",
        gray: "#6B7280",
        lightGray: "#E5E7EB",
        success: "#10B981", // Low risk
        warning: "#FBBF24", // Medium risk
        alert: "#F59E0B", // High risk
        danger: "#EF4444", // Critical risk
        info: "#3B82F6",
}

const SHADOWS = {
        small: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
        },
        medium: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
        },
        large: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
        },
}

const FONTS = {
        heading: {
                fontWeight: "bold",
                letterSpacing: 0.5,
        },
        subheading: {
                fontWeight: "600",
                letterSpacing: 0.3,
        },
        body: {
                fontSize: 16,
                lineHeight: 24,
        },
        caption: {
                fontSize: 14,
                color: COLORS.gray,
        },
}

const BOTTOM_NAV_HEIGHT = 80 // Adjust based on your app's bottom navigation height

const styles = StyleSheet.create({
        // Container styles
        container: {
                flex: 1,
                backgroundColor: COLORS.background,
        },
        safeArea: {
                flex: 1,
        },
        keyboardAvoidingView: {
                flex: 1,
        },

        // Header styles
        header: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: COLORS.white,
                ...SHADOWS.medium,
                marginHorizontal: 16,
                marginVertical: 12,
                borderRadius: 12,
        },
        headerTitle: {
                ...FONTS.heading,
                fontSize: 24,
                color: COLORS.dark,
        },
        headerButton: {
                backgroundColor: COLORS.primary,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
        },
        headerButtonText: {
                color: COLORS.white,
                fontWeight: "600",
        },

        // List container
        listContainer: {
                flex: 1,
                paddingTop: 8,
        },
        articleListContent: {
                paddingHorizontal: 16,
                paddingBottom: BOTTOM_NAV_HEIGHT + 20, // Extra padding at bottom
        },

        // Card styles
        card: {
                backgroundColor: COLORS.white,
                borderRadius: 16,
                overflow: "hidden",
                ...SHADOWS.small,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: COLORS.lightGray,
        },
        cardImageContainer: {
                height: 180,
                width: "100%",
                backgroundColor: COLORS.lightGray,
        },
        cardImage: {
                width: "100%",
                height: "100%",
                resizeMode: "cover",
        },
        cardContent: {
                padding: 16,
        },
        cardHeader: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
        },
        cardTitle: {
                ...FONTS.subheading,
                fontSize: 18,
                color: COLORS.dark,
                flex: 1,
                marginRight: 12,
        },
        cardDate: {
                ...FONTS.caption,
                fontSize: 14,
                color: COLORS.gray,
                marginBottom: 8,
        },
        cardSummary: {
                ...FONTS.body,
                fontSize: 15,
                color: COLORS.gray,
                marginBottom: 12,
                lineHeight: 22,
        },

        // Risk badges
        riskLevel: {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "flex-start",
        },
        riskText: {
                fontWeight: "600",
                fontSize: 14,
        },
        lowRisk: {
                backgroundColor: "rgba(16, 185, 129, 0.1)",
        },
        lowRiskText: {
                color: COLORS.success,
        },
        mediumRisk: {
                backgroundColor: "rgba(251, 191, 36, 0.1)",
        },
        mediumRiskText: {
                color: COLORS.warning,
        },
        highRisk: {
                backgroundColor: "rgba(245, 158, 11, 0.1)",
        },
        highRiskText: {
                color: COLORS.alert,
        },
        criticalRisk: {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
        },
        criticalRiskText: {
                color: COLORS.danger,
        },
        defaultRisk: {
                backgroundColor: "rgba(107, 114, 128, 0.1)",
        },
        defaultRiskText: {
                color: COLORS.gray,
        },

        // Tags and categories
        metadataContainer: {
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 8,
        },
        categoryContainer: {
                backgroundColor: COLORS.primaryLight,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
        },
        category: {
                ...FONTS.caption,
                color: COLORS.primary,
                fontWeight: "600",
        },
        tag: {
                ...FONTS.caption,
                color: COLORS.gray,
                borderColor: COLORS.lightGray,
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 8,
                marginBottom: 8,
        },

        // Read more button
        readMoreContainer: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: 12,
        },
        readMore: {
                ...FONTS.subheading,
                fontSize: 14,
                color: COLORS.primary,
        },

        // Detail view styles
        detailContainer: {
                flex: 1,
                backgroundColor: COLORS.white,
        },
        detailContentScrollContainer: {
                paddingBottom: BOTTOM_NAV_HEIGHT + 20,
        },
        detailImage: {
                width: "100%",
                height: 240,
                resizeMode: "cover",
                marginBottom: 16,
        },
        backButton: {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 8,
        },
        backButtonText: {
                ...FONTS.subheading,
                color: COLORS.primary,
                fontSize: 16,
        },
        detailContent: {
                paddingHorizontal: 16,
        },
        detailHeader: {
                marginBottom: 8,
        },
        detailTitle: {
                ...FONTS.heading,
                fontSize: 24,
                color: COLORS.dark,
                marginBottom: 12,
        },
        detailDate: {
                ...FONTS.caption,
                marginBottom: 16,
        },
        detailRiskLevel: {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                alignSelf: "flex-start",
                marginBottom: 12,
        },
        detailSummaryContainer: {
                backgroundColor: COLORS.primaryLight,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
        },
        detailSummaryTitle: {
                ...FONTS.subheading,
                color: COLORS.primary,
                marginBottom: 8,
        },
        detailSummary: {
                ...FONTS.body,
                color: COLORS.dark,
                fontStyle: "italic",
        },
        detailContentContainer: {
                marginBottom: 24,
        },
        detailContentParagraph: {
                ...FONTS.body,
                color: COLORS.dark,
                marginBottom: 16,
                lineHeight: 24,
        },
        detailTagsSection: {
                marginTop: 16,
                marginBottom: 24,
        },
        detailTagsTitle: {
                ...FONTS.subheading,
                fontSize: 16,
                color: COLORS.dark,
                marginBottom: 12,
        },

        // Form styles
        formContainer: {
                backgroundColor: COLORS.white,
                borderRadius: 16,
                marginHorizontal: 16,
                marginBottom: 16,
                ...SHADOWS.medium,
                zIndex: 1, // Add zIndex to ensure it appears on top
        },
        formContentContainer: {
                padding: 20,
                paddingBottom: BOTTOM_NAV_HEIGHT + 40, // Extra padding at bottom
        },
        formTitle: {
                ...FONTS.heading,
                fontSize: 22,
                color: COLORS.dark,
                marginBottom: 20,
        },
        label: {
                ...FONTS.subheading,
                color: COLORS.dark,
                marginBottom: 8,
        },
        input: {
                borderWidth: 1,
                borderColor: COLORS.lightGray,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: COLORS.dark,
                backgroundColor: COLORS.white,
                marginBottom: 16,
        },
        textArea: {
                minHeight: 120,
                textAlignVertical: "top",
        },

        // Risk level selector
        riskSelector: {
                flexDirection: "row",
                marginBottom: 20,
        },
        riskOption: {
                flex: 1,
                paddingVertical: 10,
                marginHorizontal: 4,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
        },
        riskOptionText: {
                fontWeight: "600",
                fontSize: 14,
        },
        riskOptionLow: {
                borderColor: COLORS.success,
        },
        riskOptionLowSelected: {
                backgroundColor: COLORS.success,
        },
        riskOptionMedium: {
                borderColor: COLORS.warning,
        },
        riskOptionMediumSelected: {
                backgroundColor: COLORS.warning,
        },
        riskOptionHigh: {
                borderColor: COLORS.alert,
        },
        riskOptionHighSelected: {
                backgroundColor: COLORS.alert,
        },
        riskOptionCritical: {
                borderColor: COLORS.danger,
        },
        riskOptionCriticalSelected: {
                backgroundColor: COLORS.danger,
        },

        // Form buttons
        formButtonsContainer: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
        },
        cancelButton: {
                flex: 1,
                padding: 14,
                borderRadius: 8,
                backgroundColor: COLORS.lightGray,
                alignItems: "center",
                marginRight: 8,
        },
        cancelButtonText: {
                color: COLORS.gray,
                fontWeight: "600",
        },
        submitButton: {
                flex: 2,
                padding: 14,
                borderRadius: 8,
                backgroundColor: COLORS.primary,
                alignItems: "center",
                marginLeft: 8,
        },
        submitButtonText: {
                color: COLORS.white,
                fontWeight: "600",
        },

        // Loading and error states
        loadingContainer: {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 16,
        },
        errorContainer: {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: 16,
                borderRadius: 8,
                marginHorizontal: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: COLORS.danger,
        },
        errorText: {
                ...FONTS.body,
                color: COLORS.danger,
        },
        noArticlesContainer: {
                padding: 24,
                alignItems: "center",
                justifyContent: "center",
        },
        noArticlesText: {
                ...FONTS.body,
                color: COLORS.gray,
                textAlign: "center",
                marginTop: 8,
        },

        // Bottom spacers to prevent content from being hidden
        bottomSpacer: {
                height: BOTTOM_NAV_HEIGHT + 20,
        },
        formBottomSpacer: {
                height: BOTTOM_NAV_HEIGHT + 40,
        },
})

export default HealthRiskScreen

