import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: 'AIzaSyCDq2yqovW4bzuZgjqH7ClcjzzYiXVapH0',
    authDomain:'sorveteriaobah.firebaseapp.com',
    projectId:'sorveteriaobah',
    storageBucket:'sorveteriaobah.appspot.com',
    messagingSenderId: '728690954233',
    appId:'1:728690954233:web:f3762510b8634e7ee8f728',
    measurementId: 'G-18K1TNXG21'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);
const storage = getStorage();

export {db, auth, storage};