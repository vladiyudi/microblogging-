import Navbar from "./Navbar";
import Home from "../Routes/Home.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "../Routes/Profile";
import { useState, useEffect } from "react";
import { storage } from "../fire";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  setDoc,
  getDoc,
  addDoc,
  doc,
  snapshot,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../fire.js";
import { ConstructionOutlined } from "@mui/icons-material";

export default function Calcs() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const userRef = collection(db, "Users");
  const [searchTweets, setSearchTweets] = useState("")
  const [searchUsers, setSearchUsers] = useState("")


  const updateUsersCollection = async (user) => {
    const setU = await setDoc(doc(db, "Users", user.uid), user);
  };

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName);
        setUserEmail(user.email);
        setImageUrl(user.photoURL);
      }
    });
  }, [auth]);

  const handleImageSubmit = async (profileImage) => {
    try {
      const imageRef = ref(storage, auth.currentUser.displayName.toString());
      setLoading(true);
      const snapshot = await uploadBytes(imageRef, profileImage);
      const photoUrl = await getDownloadURL(imageRef);
      const udate = await updateProfile(auth.currentUser, {
        photoURL: photoUrl,
      });
      setImageUrl(auth.currentUser.photoURL);
      const obj = { photoURL: auth.currentUser.photoURL };
      await updateDoc(doc(db, "Users", auth.currentUser.uid), obj);

      setLoading(false);
    } catch (err) {
      console.error(err.message, "error in downloading img");
      setImageUrl(null);
    }
  };

  const authUser = async (input, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const update = await updateProfile(auth.currentUser, {
        displayName: input,
      });
      setUserName(cred.user.displayName);
      setUserEmail(cred.user.email);
      updateUsersCollection({
        uid: cred.user.uid,
        displayName: cred.user.displayName,
        email: cred.user.email,
      });
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const handleLogout = async () => {
    try {
      const out = await signOut(auth);
      setUserEmail("");
      setUserName("");
      setImageUrl(null);
    } catch (err) {
      console.error("problem with logout: ", err.message);
      setError(err.message);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const handleProfile = (input, email, password) => {
    setUserName(input);
    setUserEmail(email);
    authUser(input, email, password);
  };

  const logInUser = async (input, email, password) => {
    try {
      const logedIn = await signInWithEmailAndPassword(auth, email, password);
      setUserName(input);
      setUserEmail(email);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUserEmail(result.user.email);
      setUserName(result.user.displayName);
      setImageUrl(result.user.photoURL);
      const gUser = await getDoc(doc(db, "Users", result.user.uid));
    !gUser.data() &&  updateUsersCollection({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };
  
const tweetSearch = (input)=>{
setSearchTweets(input)
}
const userSearch = (input)=>{
    setSearchUsers(input)
}

const handleLike = async (tweetID, likedTweet)=>{
    const id = auth.currentUser.uid
    const docRef = doc(db, "Users", id)
    const user = await getDoc(docRef)
    if (user.data().liked){
        let arr =  user.data().liked
        if (likedTweet){
        arr.push(tweetID)} 
        else {
            const del = arr.filter(el=>el!=tweetID)
           arr = del
        }
        const set = new Set(arr)
        const upd = Array.from(set)
        const updated = await updateDoc (docRef, {liked: upd})  
    } else {
        const updated = await updateDoc (docRef, {liked: [tweetID]}) 
    }
}

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar handleLogout={handleLogout} tweetSearch={tweetSearch} userSearch={userSearch} searchTweets={searchTweets} searchUsers={searchUsers}/>
        <Routes>
          <Route
            path="/Home"
            element={<Home searchTweets={searchTweets} searchUsers={searchUsers}  handleLike={handleLike}
            />}
          />
          <Route
            path="/"
            element={
              <Profile
                handleProfile={handleProfile}
                userName={userName}
                handleLogout={handleLogout}
                logInUser={logInUser}
                userEmail={userEmail}
                error={error}
                handleGoogle={handleGoogle}
                handleImageSubmit={handleImageSubmit}
                imageUrl={imageUrl}
                loading={loading}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
