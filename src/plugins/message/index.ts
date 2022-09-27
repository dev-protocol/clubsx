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

export const getPagePaths: ClubsFunctionGetPagePaths = async (options, { name, propertyAddress }) => {
  const tiers = options.find((opt) => opt.key === 'tiers')
  ?.value

  const formName = options.find((opt) => opt.key === 'name')?.value || "Contact Temples DAO"
  const description = options.find((opt) => opt.key === 'description')?.value || "Contact Temples DAO using form. This will help you get your queries answered in the case you have some issues or bugs"

  return [
    { paths: ['message'], component: Index, props: {  name, propertyAddress, tiers, formName, description } },
    ...forms.map((form) => ({
      paths: ['message', String(form.id)],
      component: ID,
      props: { form },
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
