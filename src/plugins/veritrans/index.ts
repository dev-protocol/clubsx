import type { Membership } from '@plugins/memberships'
import type {
  ClubsFunctionGetPagePaths,
  ClubsFunctionGetSlots,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, ClubsPluginSignal } from '@devprotocol/clubs-core'
import { default as Id } from './Id.astro'
import { keccak256 } from 'ethers'
import type { ClubsFunctionGetApiPaths } from '@devprotocol/clubs-core/src'
import { composeItems } from './utils/compose-items'
import { get } from './api/payment-key'
import { post } from './api/fulfillment'
import type { UndefinedOr } from '@devprotocol/util-ts'

export type Override = {
  id: string
  importFrom: string
  key: string
  payload: string | Uint8Array
  price: {
    yen: number
  }
}

export type ComposedItem = Override & { source: Membership }

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress, rpcUrl, chainId },
  utils,
) => {
  const items = composeItems(options, utils)

  return items
    ? [
        ...items.map((item) => ({
          paths: [
            'fiat',
            'yen',
            typeof item.payload === 'string'
              ? item.payload
              : keccak256(item.payload),
          ],
          props: {
            item,
            propertyAddress,
            rpcUrl,
            chainId,
            signals: [ClubsPluginSignal.DisplayFullPage],
            accessControlUrl: undefined, //TODO: Pass the value
            accessControlDescription: undefined, //TODO: Pass the value
          },
          component: Id,
        })),
      ]
    : []
}

export const getApiPaths: ClubsFunctionGetApiPaths = async (
  options,
  { propertyAddress, chainId, rpcUrl },
  utils,
) => {
  const items = composeItems(options, utils)
  const webhooks =
    (options.find((opt) => opt.key === 'webhooks')?.value as UndefinedOr<{
      fulfillment?: string
    }>) ?? {}

  return [
    {
      paths: ['payment-key'],
      method: 'GET',
      handler: get({ items, propertyAddress, chainId }),
    },
    {
      paths: ['fulfillment'],
      method: 'POST',
      handler: post({
        webhookOnFulfillment: webhooks?.fulfillment,
        chainId,
        rpcUrl,
      }),
    },
  ]
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:veritrans',
  displayName: 'Veritrans',
  category: ClubsPluginCategory.Monetization,
}

export default {
  getPagePaths,
  getApiPaths,
  meta,
} as ClubsFunctionPlugin
