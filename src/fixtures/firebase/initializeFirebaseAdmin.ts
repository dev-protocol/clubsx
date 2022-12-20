import { initializeApp as initializeAdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'

export const initializeFirebaseAdmin = () => {
  // Your web app's Firebase configuration.
  const firebaseConfig = {
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  }

  // Initialize Firebase Admin.
  const app = initializeAdminApp(firebaseConfig)
  const auth = getAdminAuth(app)

  return auth
}
