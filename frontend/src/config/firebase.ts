import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCwadTTfoRpVCQ7fUvxq63L7REdIfhRxmk",
  authDomain: "higher-hiring-portal.firebaseapp.com",
  projectId: "higher-hiring-portal",
  storageBucket: "higher-hiring-portal.firebasestorage.app",
  messagingSenderId: "669607397636",
  appId: "1:669607397636:web:207db77297b6d459a7e851",
  measurementId: "G-6C984N2WH2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);