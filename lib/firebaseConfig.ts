// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiyUWpBW8GIRylbQS6wkdMY_S85IZkqhM",
  authDomain: "assessment-task-adrianl01.firebaseapp.com",
  projectId: "assessment-task-adrianl01",
  storageBucket: "assessment-task-adrianl01.firebasestorage.app",
  messagingSenderId: "100965690533",
  appId: "1:100965690533:web:ed5a336d70557a35b5b14c",
  measurementId: "G-5FVESP3D8N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
