import { callSlotCollections } from './slotCollections'
import type { ethers } from 'ethers'
import type { Image } from './types/setImageArg'

const TimeImages: Image[] = [
  {
    // const { imageSrc, requiredETHAmount, requiredETHFee, gateway } = config
    src: 'https://example.com',
    name: 'example',
    description: 'example',
    deadline: 1692587652,
    requiredTokenAmount: 0,
    requiredTokenFee: 0,
    gateway: '0x0000000000000000000000000000000000000000',
  },
]
const MemberImages: Image[] = [
  {
    // const { imageSrc, requiredETHAmount, requiredETHFee, gateway } = config
    src: 'https://example.com',
    name: 'example',
    description: 'example',
    slots: 1,
    requiredTokenAmount: 0,
    requiredTokenFee: 0,
    gateway: '0x0000000000000000000000000000000000000000',
  },
]
const keys: string[] = ['0x000']

export const example = async (provider: ethers.Signer) => {
  const setTimeImage = await callSlotCollections(provider, 'setImages', true, [
    '0x0000000000000000000000000000000000000000',
    TimeImages,
    keys,
  ])
  const setMemberImage = await callSlotCollections(
    provider,
    'setImages',
    false,
    ['0x0000000000000000000000000000000000000000', MemberImages, keys],
  )
}
