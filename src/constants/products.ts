export type Product = Readonly<{
  id: string
  name: string
  description?: string
  price: number
  currency: 'DEV' | 'ETH'
  imageSrc: string
  imageAlt: string
  payload: Uint8Array | string
  fee?: {
    percentage: number
    beneficiary: string
  }
}>

export type Products = ReadonlyArray<Product>
