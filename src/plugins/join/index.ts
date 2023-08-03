import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
  ClubsPluginSignal,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'
import type { Membership } from '@plugins/memberships'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/join-1.jpg'
import Preview2 from './assets/join-2.jpg'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress, name, rpcUrl },
  { getPluginConfigById },
) => {
  const [membershipConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )
  const allMemberships = membershipConfig?.options.find(
    (opt) => opt.key === 'memberships',
  )?.value as UndefinedOr<Membership[]>

  // Filter out deprecated memberships.
  const memberships = allMemberships?.filter(
    (membership) => !membership.deprecated,
  )

  const tiers = memberships?.map((mem) => ({
    ...mem,
    currency: mem.currency.toLocaleLowerCase(),
    title: mem.name,
    amount: mem.price,
    badgeImageSrc: mem.imageSrc,
    badgeImageDescription: mem.description,
  }))
  const preferedCurrency = tiers?.every((t) => t.currency === 'eth')
    ? 'eth'
    : 'dev'

  return tiers
    ? [
        {
          paths: ['join'],
          component: Index,
          props: {
            tiers,
            propertyAddress,
            name,
            rpcUrl,
            preferedCurrency,
            signals: [ClubsPluginSignal.DisplayFullPage],
          },
        },
        ...tiers.map(({ id, amount, currency, fee, payload }) => ({
          paths: ['join', id],
          component: Id,
          props: {
            amount,
            currency,
            propertyAddress,
            rpcUrl,
            payload,
            feeBeneficiary: fee?.beneficiary,
            feePercentage: fee?.percentage,
            signals: [ClubsPluginSignal.DisplayFullPage],
          },
        })),
      ]
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:join',
  displayName: 'Join',
  category: ClubsPluginCategory.Uncategorized,
  icon: Icon,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Add checkout pages for each tier.`,
  previewImages: [Preview1, Preview2],
  readme: Readme,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
