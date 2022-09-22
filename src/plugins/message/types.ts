export type GatedMessage = {
  id: number
  title: string
  description: string
  requiredMemberships: {
    id: string
    amount: number
    payload?: number[]
  }[]
  presetName: string
  sendGridEnvKey: string
  destinationEmail: string
}
