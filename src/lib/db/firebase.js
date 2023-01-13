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

// Create and export an async function that returns all documents within the "influencers" collection
export const getInfluencers = async () => {
  const influencersQuery = query(influencersCollection);
  const influencersSnapshot = await getDocs(influencersQuery);
  
  const influencers = influencersSnapshot.docs.map((doc) => doc.data());
  
  return influencers;
};

// Create and export an async function that returns all documents within the "locations" collection
export const getLocations = async (...IDs) => {
  const locationsData = [];
  const locationIDs = [...IDs];

  for (let i = 0; i < locationIDs.length - 1; i++)
  {
    const location = locationIDs[i];
    console.log('Currently getting location for id:   ',location)
    const locationRef = doc(locationsCollection, location);
    const locationSnapshot = await getDoc(locationRef);

    if (locationSnapshot.exists()) 
    {
      const data = locationSnapshot.data();
      locationsData.push(data);
    } 
    else 
    {
      locationsData.push({not_found: true, location_id: locationIDs[i]});
    }
  }

  return locationsData;
}

// Create and export an async function that retrieves a specific document within the "locations" collection based on the locationID
export const getLocation = async (locationID) => {
  const locationRef = doc(locationsCollection, locationID);
  const locationSnapshot = await getDoc(locationRef);

  if (locationSnapshot.exists()) 
  {
    const data = locationSnapshot.data();
    return data;
  } 
  else 
  {
    return null;
  }
}

// Create and export an async function that updates a document within the "influencers" collection
export const updateInfluencer = async (username, payload) => {

  // Add a timestamp to keep track of last update to the document
  payload.last_updated = Timestamp.now().toDate();

  const influencerRef = doc(influencersCollection, username);

  try 
  {
    await setDoc(influencerRef, payload);
  } 
  catch(err) 
  {
    console.log(err);
    throw error(500, {
      message: "Error adding influencer",
      error: err 
    });
  }

  console.log(`SUCCESSFULLY UPDATED DATA FOR ${username}!`);
  
  return;
}

// Create and export an async function that updates a document within the "locations" collection
export const addOrUpdateLocation = async (locationID, payload) => {
  
  payload.last_updated = Timestamp.now().toDate();
  
  const locationRef = doc(locationsCollection, locationID);

  try 
  {
    await setDoc(locationRef, payload);
  } 
  catch(err) 
  {
    console.log(err);
    throw error(500, err);
  }

  console.log(`UPDATE FOR ${locationID} SUCCESSFUL!`);
  return;
}

// Create and export an async function that checks if date is older than 3 days
export const isOlderThanThreeDays = (date) => {
  // console.log('here is the date object received', date);

  //                   days hours min  sec  ms
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  const timestampThreeDaysAgo = Timestamp.now().toMillis() - threeDaysInMs;

  console.log("timestampThreeDaysAgo", timestampThreeDaysAgo);
  
  const timestamp = new Timestamp(date.seconds, date.nanoseconds).toMillis();
  console.log("timestamp of input date", timestamp);

  if (timestampThreeDaysAgo > timestamp) {
    // console.log('date IS MORE than 3 days into the past');
    return true;
  }
  else {
    console.log('date IS NOT MORE than 3 days into the past');
    return false;
  }
};

export const isOlderThanFiveDays = (date) => {
  // console.log('here is the date object received', date);

  //                   days hours min  sec  ms
  const threeDaysInMs = 5 * 24 * 60 * 60 * 1000;
  const timestampThreeDaysAgo = Timestamp.now().toMillis() - threeDaysInMs;

  console.log("timestampThreeDaysAgo", timestampThreeDaysAgo);
  
  const timestamp = new Timestamp(date.seconds, date.nanoseconds).toMillis();
  console.log("timestamp of input date", timestamp);

  if (timestampThreeDaysAgo > timestamp) {
    // console.log('date IS MORE than 3 days into the past');
    return true;
  }
  else {
    console.log('date IS NOT MORE than 3 days into the past');
    return false;
  }
};




