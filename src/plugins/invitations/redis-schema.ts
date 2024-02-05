import { encode } from '@devprotocol/clubs-core'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'
import { keccak256 } from 'ethers'
import { nanoid } from 'nanoid'

export const Index = 'idx::devprotocol:clubs:invitation'

export const Prefix = 'doc::devprotocol:clubs:invitation::'

export const SchemaKey = 'scm::devprotocol:clubs:invitation'

export type Invitation = {
  id: string
  disabled?: boolean
  conditions?: {
    receipient?: string[]
  }
  membership: {
    payload: string
  }
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

export const conditionsReceipient = {
  '$.conditions.receipient': {
    type: SchemaFieldTypes.TEXT,
    AS: 'conditionsReceipient',
  },
} satisfies RediSearchSchema

export const membershipPayload = {
  '$.membership.payload': {
    type: SchemaFieldTypes.TAG,
    AS: 'membershipPayload',
  },
} satisfies RediSearchSchema

export const schema = {
  ...id,
  ...disabled,
  ...conditionsReceipient,
  ...membershipPayload,
}

export const schemaId = keccak256(encode(schema))

/**
 * Generate a new invitation document
 * @param base - the invitation item without ID
 * @returns the generated new invitation document without ID duplication check
 */
export const invitationDocument = (
  base: Omit<Invitation, 'id'>,
): Invitation => ({ ...base, id: nanoid(10) })
