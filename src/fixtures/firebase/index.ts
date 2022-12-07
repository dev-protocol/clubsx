import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

export const initializeFirebase = () => {
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  }

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)

  return auth
}
