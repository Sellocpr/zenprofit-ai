import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase - RECUERDA: Debes crear un proyecto en console.firebase.google.com
// Para desarrollo, usaremos estas claves. En producción se deben usar variables de entorno.
const firebaseConfig = {
    apiKey: "AIzaSyBj7nNroEfgZ8pzAdywV_BwvTmj-580854",
    authDomain: "zenprofit-web.firebaseapp.com",
    projectId: "zenprofit-web",
    storageBucket: "zenprofit-web.firebasestorage.app",
    messagingSenderId: "621561496895",
    appId: "1:621561496895:web:ceac00618e6a7c11293f8a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
