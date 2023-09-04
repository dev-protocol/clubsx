import type { Membership } from '@plugins/memberships'
import type {
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, ClubsPluginSignal } from '@devprotocol/clubs-core'
import { default as Index } from './Index.astro'
import { default as Id } from './Id.astro'
import { keccak256 } from 'ethers'
import type { ClubsFunctionGetApiPaths } from '@devprotocol/clubs-core/src'
import { getItems } from './utils/get-items'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { bytes32Hex } from '@fixtures/data/hexlify'
import Icon from './assets/Tickets.svg'
import tickets1 from './assets/tickets-1.jpg'
import tickets2 from './assets/tickets-2.jpg'
import tickets3 from './assets/tickets-3.jpg'
import readme from './README.md'

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
  webhooks?: {
    used?: string // Encrypted URL string
  }
}
export type Tickets = Ticket[]
export type TicketHistory = { datetime: Date }
export type TicketHistories = Record<string, TicketHistory>

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
        {
          paths: ['tickets'],
          props: { tickets, memberships, propertyAddress, rpcUrl },
          component: Index,
        },
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
  { propertyAddress, rpcUrl },
) => {
  const tickets = getItems(options)
  const [{ get }, { post }] = await Promise.all([
    import('./api/get'),
    import('./api/post'),
  ])

  return [
    ...tickets.map((ticket) => ({
      paths: ['history', bytes32Hex(ticket.payload)],
      method: 'GET' as 'GET',
      handler: get({ ticket, propertyAddress }),
    })),
    ...tickets.map((ticket) => ({
      paths: ['redeem', bytes32Hex(ticket.payload)],
      method: 'POST' as 'POST',
      handler: post({ ticket, propertyAddress, rpcUrl }),
    })),
  ]
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:tickets',
  displayName: 'Tickets',
  category: ClubsPluginCategory.Growth,
  icon: Icon,
  description: 'Ticketing with your membership.',
  previewImages: [tickets1, tickets2, tickets3],
  readme,
}

export default {
  getPagePaths,
  getApiPaths,
  meta,
} as ClubsFunctionPlugin
