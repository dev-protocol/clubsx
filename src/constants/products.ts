export type Product = Readonly<{
  id: string
  name: string
  priceEth: number
  priceUsd: number
  description?: string
  left: string
  payload: string
  imageAlt: string
}>

export type Products = ReadonlyArray<Product>
