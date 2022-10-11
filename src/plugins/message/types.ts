export type GatedMessageRequiredMemberships = {
  id: string
  amount: number
  currency: string
  imageSrc: string
  payload?: number[]
}

export type GatedMessage = {
  id: number
  title: string
  description: string
  requiredMemberships: GatedMessageRequiredMemberships[]
  presetName: string
  sendGridEnvKey: string
  destinationEmail: string
}

export enum MessageSentStatus {
  NOT_SENT,
  SEND_SUCCESSFUL,
  SEND_FAILED
}
