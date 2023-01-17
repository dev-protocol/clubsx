import { Membership } from '@plugins/memberships'

export type GatedMessage = {
  id: string
  title: string
  description: string
  requiredMembershipIds: string[]
  presetName: string
  sendGridEnvKey: string
  destinationEmail: string
}

export enum MessageSentStatus {
  NOT_SENT,
  SEND_SUCCESSFUL,
  SEND_FAILED,
}
