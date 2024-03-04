import type { Membership, PricedMembership } from '@plugins/memberships'
import type { ClubsFactoryUtils } from '@devprotocol/clubs-core'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { SupportedPlugins } from '..'
import { isPriced } from '@plugins/memberships/utils/is'

export const getItems = ({
  getPluginConfigById,
}: ClubsFactoryUtils): PricedMembership[] => {
  const products: PricedMembership[] = [
    SupportedPlugins.DevprotocolClubsSimpleMemberships,
    SupportedPlugins.DevprotocolClubsPluginNft,
  ]
    .map((plugin) => {
      switch (plugin) {
        case SupportedPlugins.DevprotocolClubsSimpleMemberships:
          /**
           * Import from devprotocol:clubs:simple-memberships
           */
          const [simpleMemberships] = getPluginConfigById(
            SupportedPlugins.DevprotocolClubsSimpleMemberships,
          )
          const memberships = simpleMemberships?.options.find(
            (x) => x.key === 'memberships',
          )?.value as UndefinedOr<Membership[]>
          return memberships
            ?.filter((p) => !p.deprecated && p.currency === 'USDC')
            .filter(isPriced)

        case SupportedPlugins.DevprotocolClubsPluginNft:
          /**
           * Import from devprotocol:clubs:plugin:nft
           */
          const [nft] = getPluginConfigById(
            SupportedPlugins.DevprotocolClubsPluginNft,
          )
          const products = nft?.options.find((x) => x.key === 'products')
            ?.value as UndefinedOr<Membership[]>
          return products?.filter((p) => p.currency === 'USDC').filter(isPriced)

        default:
          return undefined
      }
    })
    .flat()
    .filter((x) => typeof x !== 'undefined') as PricedMembership[]

  return products
}
