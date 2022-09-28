export type GatedMessage = {
  id: number
  title: string
  description: string
  requiredMemberships: {
    id: string
    amount: number
    currency: string
    imageSrc: string
    payload?: number[]
  }[]
  presetName: string
  sendGridEnvKey: string
  destinationEmail: string
}
