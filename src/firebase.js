import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase - RECUERDA: Debes crear un proyecto en console.firebase.google.com
// Para desarrollo, usaremos estas claves. En producción se deben usar variables de entorno.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKey_ReplaceMe",
    authDomain: "zenprofit-ai.firebaseapp.com",
    projectId: "zenprofit-ai",
    storageBucket: "zenprofit-ai.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
