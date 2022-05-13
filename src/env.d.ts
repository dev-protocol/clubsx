interface ImportMetaEnv {
  readonly PUBLIC_SITE_NAME: string
  readonly PUBLIC_SITE_DESCRIPTION: string
  readonly PUBLIC_TWITTER_USER: string
  readonly PUBLIC_WEB3_PROVIDER_URL: string
  readonly PUBLIC_PROPERTY_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
