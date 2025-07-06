import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCm5B_l8O0Bp4v2fr_NCecSN3I_j20tifI",
  authDomain: "bellavue-eventzentrum.firebaseapp.com",
  projectId: "bellavue-eventzentrum",
  storageBucket: "bellavue-eventzentrum.firebasestorage.app",
  messagingSenderId: "595136357203",
  appId: "1:595136357203:web:30eb6bbf6445b8fc1237a6",
  measurementId: "G-ED2X9LZTRM"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Firestore-Datenbank exportieren
export const db = getFirestore(app);

// Firebase Auth exportieren
export const auth = getAuth(app);

// Analytics exportieren (optional)
export const analytics = getAnalytics(app);

export default app; 