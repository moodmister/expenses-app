// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwvRCRf28n1r63tmTmsn9DaEaSfEMNNW4",
  authDomain: "react-demo-839da.firebaseapp.com",
  projectId: "react-demo-839da",
  storageBucket: "react-demo-839da.appspot.com",
  messagingSenderId: "519423428838",
  appId: "1:519423428838:web:9494ba51cc8b181febd327"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
