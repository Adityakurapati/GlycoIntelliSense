'use client'
// src/pages/HealthRiskScreen.js
import React, { useState, useEffect } from 'react';
import { ref, get, push, set, query, orderByChild } from 'firebase/database';
import { db } from '../config/firebase';

const DB_PATH = 'healthRiskArticles';

const HealthRiskScreen = () => {
        // State variables
        const [articles, setArticles] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [showForm, setShowForm] = useState(false);
        const [selectedArticle, setSelectedArticle] = useState(null);
        const [formData, setFormData] = useState({
                title: '',
                summary: '',
                content: '',
                riskLevel: 'medium',
                category: '',
                tags: '',
                imageUrl: ''
        });
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Fetch articles on component mount
        useEffect(() => {
                fetchArticles();
        }, []);

        // Fetch all articles from Firebase Realtime Database
        const fetchArticles = async () => {
                try {
                        setLoading(true);
                        const articlesRef = query(
                                ref(db, DB_PATH),
                                orderByChild('createdAt')
                        );

                        const snapshot = await get(articlesRef);

                        if (snapshot.exists()) {
                                const articlesData = snapshot.val();

                                // Convert object to array and sort by createdAt descending
                                const fetchedArticles = Object.entries(articlesData).map(([id, data]) => ({
                                        id,
                                        ...data
                                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                                setArticles(fetchedArticles);
                        } else {
                                // No articles exist yet
                                setArticles([]);
                        }

                        setError(null);
                } catch (err) {
                        setError('Failed to fetch health risk articles');
                        console.error('Error fetching articles:', err);
                } finally {
                        setLoading(false);
                }
        };

        // Fetch a single article by ID
        const fetchArticleById = async (id) => {
                try {
                        setLoading(true);
                        const articleRef = ref(db, `${DB_PATH}/${id}`);
                        const snapshot = await get(articleRef);

                        if (snapshot.exists()) {
                                setSelectedArticle({
                                        id: id,
                                        ...snapshot.val()
                                });
                        } else {
                                setError(`Article with ID ${id} not found`);
                        }
                } catch (err) {
                        setError('Failed to fetch article details');
                        console.error('Error fetching article:', err);
                } finally {
                        setLoading(false);
                }
        };

        // Handle form input changes
        const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prevData => ({
                        ...prevData,
                        [name]: value
                }));
        };

        // Handle form submission
        const handleSubmit = async (e) => {
                e.preventDefault();

                // Validate form
                if (!formData.title || !formData.content || !formData.category) {
                        alert('Please fill out all required fields');
                        return;
                }

                setIsSubmitting(true);

                try {
                        // Process tags from comma-separated string to array
                        const processedData = {
                                ...formData,
                                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                                createdAt: new Date().toISOString(),
                                imageUrl: formData.imageUrl || '/default-health-article.jpg'
                        };

                        // Add to Firebase Realtime Database
                        const newArticleRef = push(ref(db, DB_PATH));
                        await set(newArticleRef, processedData);

                        // Update the local state with the new article
                        setArticles([
                                { id: newArticleRef.key, ...processedData },
                                ...articles
                        ]);

                        // Reset form after successful submission
                        setFormData({
                                title: '',
                                summary: '',
                                content: '',
                                riskLevel: 'medium',
                                category: '',
                                tags: '',
                                imageUrl: ''
                        });

                        setShowForm(false);
                        setError(null);

                        alert('Article added successfully!');
                } catch (err) {
                        setError('Failed to add new article');
                        console.error('Error adding article:', err);
                } finally {
                        setIsSubmitting(false);
                }
        };

        // View an article in detail
        const viewArticle = (article) => {
                setSelectedArticle(article);
        };

        // Go back to article list
        const backToList = () => {
                setSelectedArticle(null);
        };

        // Format date for display
        const formatDate = (timestamp) => {
                if (!timestamp) return 'Unknown date';

                const date = new Date(timestamp);
                return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                });
        };

        // Get color based on risk level
        const getRiskLevelColor = (level) => {
                switch (level?.toLowerCase()) {
                        case 'low':
                                return 'bg-green-100 text-green-800';
                        case 'medium':
                                return 'bg-yellow-100 text-yellow-800';
                        case 'high':
                                return 'bg-orange-100 text-orange-800';
                        case 'critical':
                                return 'bg-red-100 text-red-800';
                        default:
                                return 'bg-gray-100 text-gray-800';
                }
        };

        // Truncate text for card view
        const truncateText = (text, maxLength = 120) => {
                if (!text) return '';
                return text.length > maxLength
                        ? `${text.substring(0, maxLength)}...`
                        : text;
        };

        // Render the article form
        const renderArticleForm = () => (
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <h2 className="text-xl font-semibold mb-4">Add New Health Risk Article</h2>

                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                        Title *
                                </label>
                                <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                />
                        </div>

                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">
                                        Summary
                                </label>
                                <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="summary"
                                        type="text"
                                        name="summary"
                                        value={formData.summary}
                                        onChange={handleChange}
                                />
                        </div>

                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                                        Content *
                                </label>
                                <textarea
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        rows="6"
                                        required
                                ></textarea>
                        </div>

                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="riskLevel">
                                        Risk Level
                                </label>
                                <select
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="riskLevel"
                                        name="riskLevel"
                                        value={formData.riskLevel}
                                        onChange={handleChange}
                                >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                </select>
                        </div>

                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                                        Category *
                                </label>
                                <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="category"
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                />
                        </div>

                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                                        Tags (comma separated)
                                </label>
                                <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="tags"
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="e.g. diabetes, heart, prevention"
                                />
                        </div>

                        <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                                        Image URL
                                </label>
                                <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="imageUrl"
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                />
                        </div>

                        <div className="flex items-center justify-between">
                                <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                        Cancel
                                </button>
                                <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="submit"
                                        disabled={isSubmitting}
                                >
                                        {isSubmitting ? 'Submitting...' : 'Submit Article'}
                                </button>
                        </div>
                </form>
        );

        // Render an article card
        const renderArticleCard = (article) => (
                <div
                        key={article.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                        onClick={() => viewArticle(article)}
                >
                        {article.imageUrl && (
                                <div className="h-48 overflow-hidden">
                                        <img
                                                src={article.imageUrl}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-health-article.jpg';
                                                }}
                                        />
                                </div>
                        )}

                        <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{article.title}</h3>
                                        {article.riskLevel && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(article.riskLevel)}`}>
                                                        {article.riskLevel.charAt(0).toUpperCase() + article.riskLevel.slice(1)} Risk
                                                </span>
                                        )}
                                </div>

                                <p className="text-gray-600 text-sm mb-3">
                                        {formatDate(article.createdAt)}
                                </p>

                                {article.summary && (
                                        <p className="text-gray-700 mb-3">{truncateText(article.summary)}</p>
                                )}

                                {!article.summary && article.content && (
                                        <p className="text-gray-700 mb-3">{truncateText(article.content)}</p>
                                )}

                                {article.category && (
                                        <div className="mb-3">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                        {article.category}
                                                </span>
                                        </div>
                                )}

                                {article.tags && article.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                                {article.tags.map((tag, index) => (
                                                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                                #{tag}
                                                        </span>
                                                ))}
                                        </div>
                                )}

                                <div className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                                        Read more
                                        <svg className="w-3.5 h-3.5 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                        </svg>
                                </div>
                        </div>
                </div>
        );

        // Render article detail view
        const renderArticleDetail = () => (
                <div>
                        <button
                                onClick={backToList}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                        >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                </svg>
                                Back to Articles
                        </button>

                        <article className="bg-white rounded-lg shadow-md overflow-hidden">
                                {selectedArticle.imageUrl && (
                                        <div className="h-64 md:h-80 overflow-hidden">
                                                <img
                                                        src={selectedArticle.imageUrl}
                                                        alt={selectedArticle.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/default-health-article.jpg';
                                                        }}
                                                />
                                        </div>
                                )}

                                <div className="p-6">
                                        <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                                                <h1 className="text-3xl font-bold text-gray-900">{selectedArticle.title}</h1>
                                                {selectedArticle.riskLevel && (
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(selectedArticle.riskLevel)}`}>
                                                                {selectedArticle.riskLevel.charAt(0).toUpperCase() + selectedArticle.riskLevel.slice(1)} Risk
                                                        </span>
                                                )}
                                        </div>

                                        <div className="flex items-center text-gray-600 text-sm mb-6">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                <time>{formatDate(selectedArticle.createdAt)}</time>
                                        </div>

                                        {selectedArticle.summary && (
                                                <div className="mb-6">
                                                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Summary</h2>
                                                        <p className="text-gray-700 italic">{selectedArticle.summary}</p>
                                                </div>
                                        )}

                                        <div className="mb-6">
                                                {selectedArticle.content.split('\n').map((paragraph, index) => (
                                                        <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
                                                ))}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                                {selectedArticle.category && (
                                                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                                                                {selectedArticle.category}
                                                        </span>
                                                )}

                                                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                                                        selectedArticle.tags.map((tag, index) => (
                                                                <span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded">
                                                                        #{tag}
                                                                </span>
                                                        ))
                                                )}
                                        </div>
                                </div>
                        </article>
                </div>
        );

        // Render the article list
        const renderArticleList = () => (
                <div>
                        <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-800">Health Risk Screening</h1>
                                <button
                                        onClick={() => setShowForm(!showForm)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                                >
                                        {showForm ? 'Cancel' : 'Add New Article'}
                                </button>
                        </div>

                        {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                        {error}
                                </div>
                        )}

                        {showForm && (
                                <div className="mb-8">
                                        {renderArticleForm()}
                                </div>
                        )}

                        {loading && !showForm ? (
                                <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                        ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {articles.length > 0 ? (
                                                articles.map(article => renderArticleCard(article))
                                        ) : (
                                                <div className="col-span-full text-center py-12 text-gray-500">
                                                        No health risk articles found. Be the first to add one!
                                                </div>
                                        )}
                                </div>
                        )}
                </div>
        );

        // Main render logic
        return (
                <div className="container mx-auto px-4 py-8">
                        {selectedArticle ? renderArticleDetail() : renderArticleList()}
                </div>
        );
};

export default HealthRiskScreen;