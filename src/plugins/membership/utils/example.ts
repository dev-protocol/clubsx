import { callSimpleCollections } from './simpleCollections'
import { BaseProvider } from '@ethersproject/providers'
import { Image, propertyAddressType, keysType } from './types/setImageArg'
import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'

// const config: ClubsConfiguration

const propertyAddress: propertyAddressType = {
  // const { propertyAddress } = config
  propertyAddress: '0x0000000000000000000000000000000000000000',
}

const image: Image[] = [
  {
    // const { imageSrc, requiredETHAmount, requiredETHFee, gateway } = config
    imageSrc: 'https://example.com',
    requiredETHAmount: 0,
    requiredETHFee: 0,
    gateway: '0x0000000000000000000000000000000000000000',
  },
]
const keys: keysType[] = [
  // const { key } = config
  {
    key: '0x000',
  },
]

export const example = async (provider: BaseProvider) => {
  const setImage = await callSimpleCollections(provider, 'setImage', [
    propertyAddress,
    image,
    keys,
  ])
}
