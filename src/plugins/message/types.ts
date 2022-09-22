export type GatedMessage = {
  id: number
  title: string
  description: string
  membershipIds: string[]
  presetName: string
  sendGridEnvKey: string
  destinationEmail: string
}
