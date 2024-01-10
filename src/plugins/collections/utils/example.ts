import { callSlotCollections } from './slotCollections'
import type { ethers } from 'ethers'
import type { Image } from './types/setImageArg'

const Images: Image[] = [
  {
    // const { imageSrc, requiredETHAmount, requiredETHFee, gateway } = config
    src: 'https://example.com',
    name: 'example',
    description: 'example',
    deadline: 1692587652,
    members: 100,
    requiredTokenAmount: 0,
    requiredTokenFee: 0,
    gateway: '0x0000000000000000000000000000000000000000',
  },
]

const keys: string[] = ['0x000']

export const example = async (provider: ethers.Signer) => {
  const setImage = await callSlotCollections(provider, 'setImages', [
    '0x0000000000000000000000000000000000000000',
    Images,
    keys,
  ])
}
