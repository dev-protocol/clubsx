/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_YOUTUBE_CLIENT_ID: string
  readonly PUBLIC_DISCORD_CLIENT_ID: string
  readonly PUBLIC_DISCORD_CLIENT_SECRET: string
  readonly PUBLIC_FIREBASE_API_KEY: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  readonly PUBLIC_FIREBASE_APP_ID: string
  readonly PUBLIC_FIREBASE_CALLBACK_SIGNIN_URL: string
  readonly PUBLIC_EMAIL_AUTH_ENDPOINT: string
  readonly PUBLIC_GATED_CONTACT_FORM_SENDGRID_ENV_KEY: string
  readonly PUBLIC_ONDATO_VERIFICATION_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/dist/runtime/server'
  export default InstanceType<AstroComponentFactory>
}
