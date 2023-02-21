import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { error } from "@sveltejs/kit"
import { collection, query, getDocs, getDoc, doc, setDoc, Timestamp } from "firebase/firestore";

import { 
  PRIVATE_FIREBASE_API_KEY,
  PRIVATE_FIREBASE_AUTH_DOMAIN,
  PRIVATE_FIREBASE_PROJECT_ID,
  PRIVATE_FIREBASE_STORAGE_BUCKET,
  PRIVATE_FIREBASE_MESSAGING_SENDER_ID,
  PRIVATE_FIREBASE_APP_ID,
  PRIVATE_FIREBASE_MEASUREMENT_ID
} from "$env/static/private";

const firebaseConfig = {
  apiKey: PRIVATE_FIREBASE_API_KEY,
  authDomain: PRIVATE_FIREBASE_AUTH_DOMAIN,
  projectId: PRIVATE_FIREBASE_PROJECT_ID,
  storageBucket: PRIVATE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PRIVATE_FIREBASE_MESSAGING_SENDER_ID,
  appId: PRIVATE_FIREBASE_APP_ID,
  measurementId: PRIVATE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Create a reference to the "influencers" and "locations" collections
const influencersCollection = collection(db, "influencers");
const locationsCollection = collection(db, "locations");

// Function that retrieves all documents from the "influencers" collection
export const getInfluencers = async () => {
  const influencersQuery = query(influencersCollection);
  const influencersSnapshot = await getDocs(influencersQuery);
  
  const influencers = influencersSnapshot.docs.map((doc) => doc.data());
  
  return influencers;
};

// Function that returns the location data for a given location ID, or null if location does not exist
export const getLocation = async (locationID) => {
  const locationRef = doc(locationsCollection, locationID);
  const locationSnapshot = await getDoc(locationRef);

  if (locationSnapshot.exists()) {
    const data = locationSnapshot.data();
    return data;
  } else {
    return null;
  }
}

// Function that updated the data for a given influencer
export const updateInfluencer = async (username, payload) => {

  const influencerRef = doc(influencersCollection, username);
  const data = {...payload, last_updated: Timestamp.now().toDate()};

  try {
    await setDoc(influencerRef, data);
  } catch(err) {
    console.error(err);
    throw error(500, {
      message: "Error adding influencer",
      error: err 
    });
  }

  // console.log(`SUCCESSFULLY UPDATED DATA FOR ${username}!`); 
  
  return;
}

// Function that adds new data or updates an outdated data entry wihtin the "locations" collection
export const addOrUpdateLocation = async (locationID, payload) => {
  
  const locationRef = doc(locationsCollection, locationID);
  
  const data = {...payload, last_updated: Timestamp.now().toDate()};

  try {
    await setDoc(locationRef, data);
  } catch(err) {
    console.error(err);
  }

  return;
}

// Function that checks if date is older than 3 days
export const isOlderThanThreeDays = (date) => {
  // console.log('here is the date object received', date);

  //                   days hours min  sec  ms
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  const timestampThreeDaysAgo = Timestamp.now().toMillis() - threeDaysInMs;

  // console.log("timestampThreeDaysAgo", timestampThreeDaysAgo);
  
  const timestamp = new Timestamp(date.seconds, date.nanoseconds).toMillis();
  // console.log("timestamp of input date", timestamp);

  if (timestampThreeDaysAgo > timestamp) {
    // console.log('date IS MORE than 3 days into the past');
    return true;
  }
  else {
    // console.log('date IS NOT MORE than 3 days into the past');
    return false;
  }
};

// Function that checks if date is older than 5 days
export const isOlderThanFiveDays = (date) => {
  // console.log('here is the date object received', date);

  //                   days hours min  sec  ms
  const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
  const timestampFiveDaysAgo = Timestamp.now().toMillis() - fiveDaysInMs;

  // console.log("timestampThreeDaysAgo", timestampFiveDaysAgo);
  
  const timestamp = new Timestamp(date.seconds, date.nanoseconds).toMillis();
  // console.log("timestamp of input date", timestamp);

  if (timestampFiveDaysAgo > timestamp) {
    // console.log('date IS MORE than 3 days into the past');
    return true;
  }
  else {
    // console.log('date IS NOT MORE than 3 days into the past');
    return false;
  }
};




