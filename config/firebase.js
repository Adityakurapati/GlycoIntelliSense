// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // Import for Realtime Database
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig={
        apiKey: "AIzaSyD04GBzKKyxBrSGL7LeLq99Y37YsEB6aOg",
        authDomain: "thirdeye-c5b2e.firebaseapp.com",
        databaseURL: "https://thirdeye-c5b2e-default-rtdb.firebaseio.com", // Realtime Database URL
        projectId: "thirdeye-c5b2e",
        storageBucket: "thirdeye-c5b2e.firebasestorage.app",
        messagingSenderId: "97667042020",
        appId: "1:97667042020:web:4178bc2c8e9d6818fb7af1",
        measurementId: "G-FE8WSFS1B7"
};

// Initialize Firebase
const app=initializeApp( firebaseConfig );
const db=getDatabase( app ); // Initialize Realtime Database
const auth=getAuth( app );

export { app, db, auth };