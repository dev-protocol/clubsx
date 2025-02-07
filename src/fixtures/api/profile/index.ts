import { generateProfileId } from '@fixtures/api/keys'
import type { Profile } from '@pages/api/profile'
import { getDefaultProfile } from './utils'
import { mergeDeepRight } from 'ramda'
import { ZeroAddress } from 'ethers'
import { forSkinPreview } from '@constants/profiles'
import { Redis } from '@devprotocol/clubs-core/redis'

export const getProfile = async ({ id }: { id: string }) => {
  if (id === ZeroAddress) {
    return mergeDeepRight(await getDefaultProfile({ id }), forSkinPreview)
  }
  const client = await Redis.client()

  const profileId = generateProfileId(id)

  const userProfileData = (await client.get(profileId)) ?? '{}'

  const fromDb: Profile = JSON.parse(userProfileData)
  const userAvatar = fromDb.avatar
  const userName = fromDb.username
  const defaultProfile: Profile =
    !userAvatar || !userName ? await getDefaultProfile({ id }) : { skins: [] }

  const profile = mergeDeepRight(defaultProfile, fromDb)

  return profile
}
