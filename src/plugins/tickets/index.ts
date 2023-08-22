import type { Membership } from '@plugins/memberships'
import type {
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, ClubsPluginSignal } from '@devprotocol/clubs-core'
import { default as Id } from './Id.astro'
import { keccak256 } from 'ethers'
import type { ClubsFunctionGetApiPaths } from '@devprotocol/clubs-core/src'
import { getItems } from './utils/get-items'
import type { UndefinedOr } from '@devprotocol/util-ts'

export type Ticket = {
  payload: string | Uint8Array
  importedFrom: {
    plugin: string
    key: string
  }
  name: string
  uses: {
    id: string
    description: string
    duration?: string
    dependsOn?: string
    refreshCycle?: string
  }[]
  historyDbKey: string
}
export type Tickets = Ticket[]
export type TicketHistory = {
  id: string
  datetime: Date
}[]

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress, rpcUrl },
  { getPluginConfigById },
) => {
  const tickets = getItems(options)

  const memberships: UndefinedOr<Membership>[] = tickets.map((tk) => {
    const [plg] = getPluginConfigById(tk.importedFrom.plugin)
    const options = plg?.options.find((opt) => opt.key === tk.importedFrom.key)
      ?.value as UndefinedOr<Membership[]>
    const membership = options?.find(
      (opt) => JSON.stringify(opt.payload) === JSON.stringify(tk.payload),
    )
    return membership
  })

  console.log({ tickets })

  return tickets
    ? [
        ...tickets.map((ticket, index) => ({
          paths: [
            'tickets',
            typeof ticket.payload === 'string'
              ? ticket.payload
              : keccak256(ticket.payload),
          ],
          props: {
            ticket,
            membership: memberships[index],
            propertyAddress,
            rpcUrl,
            signals: [ClubsPluginSignal.DisplayFullPage],
          },
          component: Id,
        })),
      ]
    : []
}

export const getApiPaths: ClubsFunctionGetApiPaths = async (
  options,
  { propertyAddress, chainId },
  utils,
) => {
  const tickets = getItems(options)
  const { get } = await import('./api/get')

  return [
    ...tickets.map((ticket) => ({
      paths: ['history', ticket.historyDbKey],
      method: 'GET' as 'GET',
      handler: get({ ticket }),
    })),
  ]
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:tickets',
  displayName: 'Tickets',
  category: ClubsPluginCategory.Growth,
}

export default {
  getPagePaths,
  getApiPaths,
  meta,
} as ClubsFunctionPlugin
