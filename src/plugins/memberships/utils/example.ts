import { callSimpleCollections } from './simpleCollections'
import { BaseProvider } from '@ethersproject/providers'
import { Image } from './types/setImageArg'

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

export const example = async (provider: BaseProvider) => {
  const setImage = await callSimpleCollections(provider, 'setImages', [
    '0x0000000000000000000000000000000000000000',
    image,
    keys,
  ])
}
