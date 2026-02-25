import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Accurate configuration provided by CEO
const firebaseConfig = {
    apiKey: "AIzaSyCwqNaoTcXAdLyyIx8YtoLLCJ_vwNI1uoY",
    authDomain: "language-therapy-58893.firebaseapp.com",
    projectId: "language-therapy-58893",
    storageBucket: "language-therapy-58893.firebasestorage.app",
    messagingSenderId: "439861433948",
    appId: "1:439861433948:web:4c3661970843623a37f899"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'en'; // Force English for global rollout (overrides browser language)
export const db = getFirestore(app);
export default app;
