/// <reference types="vite/client" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  readonly PUBLIC_FIREBASE_APP_ID: string
  readonly PUBLIC_FIREBASE_CALLBACK_SIGNIN_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/dist/runtime/server'
  export default InstanceType<AstroComponentFactory>
}
