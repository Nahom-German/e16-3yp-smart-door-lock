// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkJwiaiTjN4qQN0OafTknndIpziZCBs10",
  authDomain: "astu-security-system.firebaseapp.com",
  databaseURL: "https://astu-security-system-default-rtdb.firebaseio.com",
  projectId: "astu-security-system",
  storageBucket: "astu-security-system.appspot.com",
  messagingSenderId: "1078880619894",
  appId: "1:1078880619894:web:6696fe44f987022911fe57",
  measurementId: "G-D6VYH7FKP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export {app, analytics};