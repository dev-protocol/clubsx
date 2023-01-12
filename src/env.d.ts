/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  readonly PUBLIC_FIREBASE_APP_ID: string
  readonly PUBLIC_FIREBASE_CALLBACK_URL: string
  readonly PUBLIC_FIREBASE_CALLBACK_SIGNIN_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
