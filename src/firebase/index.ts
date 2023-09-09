import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

/**
 * Inicializando conexão com o banco de dados do Firebase.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_KEY,
    authDomain:import.meta.env.VITE_AUTHDOMAIN,
    projectId:import.meta.env.VITE_ID,
    storageBucket:import.meta.env.VITE_STORAGE,
    messagingSenderId:import.meta.env.VITE_MESSAGING,
    appId:import.meta.env.VITE_APPID,
    measurementId: import.meta.env.VITE_MEASUREMENTID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);
const storage = getStorage();
const realtimeDb = getDatabase(app);

export {db, auth, storage, realtimeDb};