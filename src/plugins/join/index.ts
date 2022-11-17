import type { Tiers } from '@constants/tier'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress, name, rpcUrl }
) => {
  const tiers = options.find((opt) => opt.key === 'tiers')
    ?.value as UndefinedOr<Tiers>

  return tiers
    ? [
        {
          paths: ['join'],
          component: Index,
          props: { tiers, propertyAddress, name, rpcUrl },
        },
        ...tiers.map(({ id, amount, currency }) => ({
          paths: ['join', id],
          component: Id,
          props: { amount, currency, propertyAddress, rpcUrl },
        })),
      ]
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'Join' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
