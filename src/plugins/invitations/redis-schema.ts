import { encode } from '@devprotocol/clubs-core'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'
import { keccak256, toUtf8Bytes } from 'ethers'
import { nanoid } from 'nanoid'

export enum Index {
  Invitation = 'idx::devprotocol:clubs:invitation:code',
  History = 'idx::devprotocol:clubs:invitation:history',
}

export enum Prefix {
  Invitation = 'doc::devprotocol:clubs:invitation:code::',
  History = 'doc::devprotocol:clubs:invitation:history::',
}

export enum SchemaKey {
  Invitation = 'scm::devprotocol:clubs:invitation:code',
  History = 'scm::devprotocol:clubs:invitation:history',
}

export type Invitation = {
  id: string
  disabled?: boolean
  conditions?: {
    recipients?: string[]
    maxRedemptions?: number
  }
  membership: {
    payload: string
  }
}

export type History = {
  id: string
  usedId: string
  datetime: number
  account: string
}

export const id = {
  '$.id': {
    type: SchemaFieldTypes.TAG,
    AS: 'id',
  },
} satisfies RediSearchSchema

export const disabled = {
  '$.disabled': {
    type: SchemaFieldTypes.TAG,
    AS: 'disabled',
  },
} satisfies RediSearchSchema

export const conditionsRecipients = {
  '$.conditions.recipients': {
    type: SchemaFieldTypes.TEXT,
    AS: 'conditionsRecipients',
  },
} satisfies RediSearchSchema

export const membershipPayload = {
  '$.membership.payload': {
    type: SchemaFieldTypes.TAG,
    AS: 'membershipPayload',
  },
} satisfies RediSearchSchema

export const usedId = {
  '$.usedId': {
    type: SchemaFieldTypes.TAG,
    AS: 'usedId',
  },
} satisfies RediSearchSchema

export const datetime = {
  '$.datetime': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'datetime',
  },
} satisfies RediSearchSchema

export const account = {
  '$.account': {
    type: SchemaFieldTypes.TAG,
    AS: 'account',
  },
} satisfies RediSearchSchema

export const schemaInvitation = {
  ...id,
  ...disabled,
  ...conditionsRecipients,
  ...membershipPayload,
}

export const schemaHistory = {
  ...id,
  ...usedId,
  ...datetime,
  ...account,
}

export const schemaInvitationId = keccak256(
  toUtf8Bytes(encode(schemaInvitation)),
)

export const schemaHistoryId = keccak256(toUtf8Bytes(encode(schemaHistory)))

/**
 * Generate a new invitation document
 * @param base - the invitation item without ID
 * @returns the generated new invitation document without ID duplication check
 */
export const invitationDocument = (
  base: Omit<Invitation, 'id'>,
): Invitation => ({ ...base, id: nanoid(10) })

/**
 * Generate a new history document
 * @param base - the history item without ID
 * @returns the generated new history document without ID duplication check
 */
export const historyDocument = (base: Omit<History, 'id'>): History => ({
  ...base,
  id: nanoid(),
})

/**
 * Returns string that available for searching as TAG
 * @param id - the base string
 * @returns the TAG string
 */
export const uuidToQuery = (id: string) => id.replaceAll('-', '\\-')
