import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as ID } from './id.astro'

type GatedMessage = {
  id: number
  title: string
  description: string
  membershipIds: number[]
  presetName: string
  sendGridEnvKey: string
  destinationEmail: string
}

export const getPagePaths: ClubsFunctionGetPagePaths = async () => [
  { paths: ['message'], component: Index },
  { paths: ['message', '1'], component: ID },
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'Message' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
