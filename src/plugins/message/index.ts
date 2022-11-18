import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as ID } from './[id].astro'
import json from './forms.json'
import { GatedMessage } from './types'

const forms: GatedMessage[] = json

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress }
) => {
  return [
    {
      paths: ['message'],
      component: Index,
      props: { forms },
    },
    ...forms.map((form) => ({
      paths: ['message', String(form.id)],
      component: ID,
      props: { propertyAddress, form },
    })),
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'Message' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
