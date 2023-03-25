import { callSimpleCollections } from './simpleCollections'
import type { ethers } from 'ethers'
import type { Image } from './types/setImageArg'

const image: Image[] = [
  {
    // const { imageSrc, requiredETHAmount, requiredETHFee, gateway } = config
    src: 'https://example.com',
    requiredETHAmount: 0,
    requiredETHFee: 0,
    gateway: '0x0000000000000000000000000000000000000000',
  },
]
const keys: string[] = ['0x000']

export const example = async (provider: ethers.Signer) => {
  const setImage = await callSimpleCollections(provider, 'setImages', [
    '0x0000000000000000000000000000000000000000',
    image,
    keys,
  ])
}
