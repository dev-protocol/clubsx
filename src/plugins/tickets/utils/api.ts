import { bytes32Hex } from '@devprotocol/clubs-core'
import { isMembershipTicket, meta, type Ticket } from '..'

export const requestToGetHistory = (ticket: Ticket, id: string | number) =>
  fetch(
    `/api/${meta.id}/history/${isMembershipTicket(ticket) ? bytes32Hex(ticket.payload) : ticket.erc721Enumerable}?id=${id}`,
  )

export const requestToPostRedeem = (
  ticket: Ticket,
  body: {
    id?: string | number
    benefitId: string
    hash: string
    sig: string
  },
) =>
  fetch(
    `/api/${meta.id}/redeem/${
      isMembershipTicket(ticket)
        ? bytes32Hex(ticket.payload)
        : ticket.erc721Enumerable
    }`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
