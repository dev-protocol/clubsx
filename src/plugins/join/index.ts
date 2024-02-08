import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
  ClubsPluginSignal,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'
import type { Membership } from '@plugins/memberships'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/join-1.jpg'
import Preview2 from './assets/join-2.jpg'
import { isPriced } from '@plugins/memberships/utils/is'

export const getPagePaths = (async (
  _,
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

  const tiers = memberships?.filter(isPriced)?.map((mem) => ({
    ...mem,
    currency: mem.currency.toLocaleLowerCase(),
    title: mem.name,
    amount: mem.price,
    badgeImageSrc: mem.imageSrc,
    badgeImageDescription: mem.description,
  }))

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
            signals: [ClubsPluginSignal.DisplayFullPage],
          },
        },
        ...tiers.map(
          ({
            id,
            amount,
            currency,
            fee,
            payload,
            description,
            accessControl,
            imageSrc,
            name,
          }) => ({
            paths: ['join', id],
            component: Id,
            props: {
              amount,
              currency,
              propertyAddress,
              rpcUrl,
              payload,
              description,
              feeBeneficiary: fee?.beneficiary,
              feePercentage: fee?.percentage,
              signals: [ClubsPluginSignal.DisplayFullPage],
              itemImageSrc: imageSrc,
              itemName: name,
              accessControlUrl: accessControl?.url,
              accessControlDescription: accessControl?.description,
            },
          }),
        ),
      ]
    : []
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths =
  (async () => []) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:plugin:join',
  displayName: 'Join',
  category: ClubsPluginCategory.Uncategorized,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Add checkout pages for each tier.`,
  previewImages: [Preview1.src, Preview2.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
