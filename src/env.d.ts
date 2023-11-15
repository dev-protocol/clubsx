/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  readonly PUBLIC_FIREBASE_APP_ID: string
  readonly PUBLIC_FIREBASE_CALLBACK_SIGNIN_URL: string
  readonly PUBLIC_EMAIL_AUTH_ENDPOINT: string
  readonly PUBLIC_GATED_CONTACT_FORM_SENDGRID_ENV_KEY: string
  readonly PUBLIC_WEB3AUTH_CLIENT_ID: string
  readonly PUBLIC_WEB3AUTH_NETWORK: 'sapphire_devnet' | 'sapphire_mainnet'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/dist/runtime/server'
  export default InstanceType<AstroComponentFactory>
}
