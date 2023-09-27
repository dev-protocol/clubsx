import { getAuth } from 'firebase/auth'
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'

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

  let app: FirebaseApp

  const apps: FirebaseApp[] = getApps()
  if (apps.length > 0) {
    app = getApp()
  } else {
    // Initialize Firebase
    app = initializeApp(firebaseConfig)
  }

  const auth = getAuth(app)

  return auth
}
