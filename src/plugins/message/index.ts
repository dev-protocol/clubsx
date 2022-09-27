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

const testMemberships = [
  {
    id: 'tier-3',
    name: 'Tier 3',
    description: undefined,
    price: 400,
    currency: 'DEV',
    imageSrc:
      'https://gaijinpot.scdn3.secure.raxcdn.com/app/uploads/sites/6/2017/07/Kiyomizudera-Temple-Kyoto.jpg',
    payload: new Uint8Array(),
    fee: undefined,
  },
  {
    id: 'tier-2',
    name: 'Tier 2',
    description: undefined,
    price: 4000,
    currency: 'DEV',
    imageSrc:
      'https://gaijinpot.scdn3.secure.raxcdn.com/app/uploads/sites/6/2017/07/Kiyomizudera-Temple-Kyoto.jpg',
    payload: new Uint8Array(),
    fee: undefined,
  },
  {
    id: 'tier-1',
    name: 'Tier 1',
    description: undefined,
    price: 10000,
    currency: 'DEV',
    imageSrc:
      'https://gaijinpot.scdn3.secure.raxcdn.com/app/uploads/sites/6/2017/07/Kiyomizudera-Temple-Kyoto.jpg',
    payload: new Uint8Array(),
    fee: undefined,
  },
  {
    id: 'super',
    name: 'Super',
    description: undefined,
    price: 15000,
    currency: 'DEV',
    imageSrc:
      'https://gaijinpot.scdn3.secure.raxcdn.com/app/uploads/sites/6/2017/07/Kiyomizudera-Temple-Kyoto.jpg',
    payload: new Uint8Array(),
    fee: undefined,
  },
]

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, propertyAddress }
) => {
  const formName = options.find((opt) => opt.key === 'name')?.value || 'Contact'
  const description =
    options.find((opt) => opt.key === 'description')?.value ||
    'Contact Temples DAO using form. This will help you get your queries answered in the case you have some issues or bugs'
  const memberships =
    options.find((opt) => opt.key === 'memberships')?.value || testMemberships

  return [
    {
      paths: ['message'],
      component: Index,
      props: { name, propertyAddress, formName, description, memberships },
    },
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
