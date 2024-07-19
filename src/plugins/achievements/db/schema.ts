import { keccak256, toUtf8Bytes } from 'ethers'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'

import { encode } from '@devprotocol/clubs-core'

export const id = {
  '$.id': {
    type: SchemaFieldTypes.TAG,
    AS: 'id',
  },
} satisfies RediSearchSchema

export const contract = {
  '$.contract': {
    type: SchemaFieldTypes.TAG,
    AS: 'contract',
  },
} satisfies RediSearchSchema

export const metadataName = {
  '$.metadata.name': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataName',
  },
} satisfies RediSearchSchema

export const metadataDescription = {
  '$.metadata.description': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataDescription',
  },
} satisfies RediSearchSchema

export const metadataImage = {
  '$.metadata.image': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataImage',
  },
} satisfies RediSearchSchema

export const metadataNumberAttributes = {
  '$.metadata.numberAttributes': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataNumberAttributes',
  },
} satisfies RediSearchSchema

export const metadataStringAttributes = {
  '$.metadata.stringAttributes': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataStringAttributes',
  },
} satisfies RediSearchSchema

export const conditionsRecipients = {
  '$.conditions.recipients': {
    type: SchemaFieldTypes.TEXT,
    AS: 'conditionsRecipients',
  },
} satisfies RediSearchSchema

export const conditionsMaxRedemptions = {
  '$.conditions.maxRedemptions': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'conditionsMaxRedemptions',
  },
} satisfies RediSearchSchema

export const achievementInfoId = {
  '$.achievementInfoId': {
    type: SchemaFieldTypes.TAG,
    AS: 'achievementInfoId',
  },
} satisfies RediSearchSchema

export const achievementDistId = {
  '$.achievementDistId': {
    type: SchemaFieldTypes.TAG,
    AS: 'achievementDistId',
  },
} satisfies RediSearchSchema

export const account = {
  '$.account': {
    type: SchemaFieldTypes.TAG,
    AS: 'account',
  },
} satisfies RediSearchSchema

export const createdOnTimestamp = {
  '$.createdOnTimestamp': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'createdOnTimestamp',
  },
} satisfies RediSearchSchema

export const claimedOnTimestamp = {
  '$.claimedOnTimestamp': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'claimedOnTimestamp',
  },
} satisfies RediSearchSchema

export const claimedSBTTokenId = {
  '$.claimedSBTTokenId': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'claimedSBTTokenId',
  },
} satisfies RediSearchSchema

export const clubsUrl = {
  '$.clubsUrl': {
    type: SchemaFieldTypes.TAG,
    AS: 'clubsUrl',
  },
} satisfies RediSearchSchema
/* <<<<< ACHIEVEMENT REWARDED SCHEMA <<<<< */

/* >>>>> ACHIEVEMENT INFO SCHEMA >>>>> */
/// @dev This schema is used to store info of achievements. There will
/// be only one achievement info for one kind of achievements. The id will be
/// derived from payload(fields of object) of info to avoid duplication and easy checking.
export const ACHIEVEMENT_INFO_SCHEMA = {
  ...id,
  ...contract,
  ...metadataName,
  ...metadataDescription,
  ...metadataImage,
  ...metadataNumberAttributes,
  ...metadataStringAttributes,
}

export const ACHIEVEMENT_INFO_SCHEMA_ID = keccak256(
  toUtf8Bytes(encode(ACHIEVEMENT_INFO_SCHEMA)),
)
/* <<<<< ACHIEVEMENT INFO SCHEMA <<<<< */

/* >>>>> ACHIEVEMENT REWARDED SCHEMA >>>>> */
/// @dev This schema is used to store the achievement given to a user.
/// The achievement id can be used to fetch metadata and info of what achievement is
/// unlocked by the user. This way many users can have sample achievements and/or a user
/// can unlock multiple achievements of same type.
export const ACHIEVEMENT_ITEM_SCHEMA = {
  ...id,
  ...achievementInfoId,
  ...achievementDistId,
  ...account,
  ...claimedOnTimestamp,
  ...claimedSBTTokenId,
  ...clubsUrl,
}

export const ACHIEVEMENT_ITEM_SCHEMA_ID = keccak256(
  toUtf8Bytes(encode(ACHIEVEMENT_ITEM_SCHEMA)),
)
/* <<<<< ACHIEVEMENT REWARDED SCHEMA <<<<< */

/* >>>>> ACHIEVEMENT DIST SCHEMA >>>>> */
/// @dev This schema is used to store the achievement given to a user.
/// The achievement id can be used to fetch metadata and info of what achievement is
/// unlocked by the user. This way many users can have sample achievements and/or a user
/// can unlock multiple achievements of same type.
export const ACHIEVEMENT_DIST_SCHEMA = {
  ...id,
  ...achievementInfoId,
  ...conditionsRecipients,
  ...conditionsMaxRedemptions,
  ...createdOnTimestamp,
  ...clubsUrl,
}

export const ACHIEVEMENT_DIST_SCHEMA_ID = keccak256(
  toUtf8Bytes(encode(ACHIEVEMENT_DIST_SCHEMA)),
)
/* <<<<< ACHIEVEMENT DIST SCHEMA <<<<< */
