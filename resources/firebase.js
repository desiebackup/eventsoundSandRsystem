import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 add this

const firebaseConfig = {
  apiKey: "AIzaSyC2evKi24XEW_9y6tbrB92BqvYHW3svlCk",
  authDomain: "eventsoundsandrsystem.firebaseapp.com",
  projectId: "eventsoundsandrsystem",
  storageBucket: "eventsoundsandrsystem.firebasestorage.app",
  messagingSenderId: "801712420161",
  appId: "1:801712420161:web:90586e362517b12fe7ddc0",
  measurementId: "G-V07TGZ31YR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app); // 👈 Firestore database
const provider = new GoogleAuthProvider();

// Export all you need
export { auth, db, provider, signInWithPopup };
