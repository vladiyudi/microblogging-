import firebase, { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXTk6CadA1vxhe3-cY8U6U2XwOJXYnw5c",
  authDomain: "twitter-app-e34e2.firebaseapp.com",
  projectId: "twitter-app-e34e2",
  storageBucket: "twitter-app-e34e2.appspot.com",
  messagingSenderId: "868377901483",
  appId: "1:868377901483:web:e801e9c40a475f1254faee",
  measurementId: "G-S8375C9WHG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



// const getFirestore = async ()=>{
//    const snapshot = await getDocs(colRef)
//    console.log(snapshot.docs)
// }


export const db = getFirestore(app);

