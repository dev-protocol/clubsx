import {
  initializeApp as initializeAdminApp,
  type App,
  getApp,
  getApps,
} from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'

export const initializeFirebaseAdmin = () => {
  // Your web app's Firebase configuration.
  const firebaseConfig = {
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  }

  let app: App

  const apps = getApps()
  if (apps.length > 0) {
    app = getApp()
  } else {
    // Initialize Firebase Admin.
    app = initializeAdminApp(firebaseConfig)
  }

  const auth = getAdminAuth(app)

  return auth
}
