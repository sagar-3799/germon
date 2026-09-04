/**
 * GERMON IT SOLUTION PVT. LTD. - Firebase Configuration & Initialization
 * 
 * Instructions:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a Project named "Germon IT Portal"
 * 3. Enable Authentication (Email/Password) & Cloud Firestore
 * 4. Create a Web App and replace the config placeholder below with your Firebase credentials.
 */

(function () {
  'use strict';

  // Replace this config object with your actual credentials from Firebase Console
  const firebaseConfig = {
    apiKey: "AIzaSyBw_2mW92ZC0jhTSL9jt05BXcCxhe99vTQ",
    authDomain: "germon-it-portal.firebaseapp.com",
    projectId: "germon-it-portal",
    storageBucket: "germon-it-portal.firebasestorage.app",
    messagingSenderId: "619411153169",
    appId: "1:619411153169:web:5ab80740d3711bccececb0",
    measurementId: "G-6YHJ94807M"
  };

  window.GermonFirebase = {
    isConfigured: function () {
      return (
        firebaseConfig.apiKey &&
        firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
        firebaseConfig.projectId !== "YOUR_PROJECT_ID"
      );
    },
    config: firebaseConfig,
    app: null,
    db: null,
    auth: null
  };

  // Initialize Firebase if CDN scripts are present and configured
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        if (window.GermonFirebase.isConfigured()) {
          window.GermonFirebase.app = firebase.initializeApp(firebaseConfig);
          window.GermonFirebase.db = firebase.firestore();
          window.GermonFirebase.auth = firebase.auth();

          // Enable offline persistence
          window.GermonFirebase.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
            if (err.code === 'failed-precondition') {
              console.warn('Firestore persistence failed: Multiple tabs open');
            } else if (err.code === 'unimplemented') {
              console.warn('Firestore persistence not supported by browser');
            }
          });

          console.log('✅ Firebase initialized successfully.');
        } else {
          console.warn('⚠️ Firebase credentials not configured in firebase-config.js. Falling back to LocalStorage.');
        }
      }
    } catch (e) {
      console.error('Firebase initialization error:', e);
    }
  }
})();
