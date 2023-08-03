import { BrowserProvider, Eip1193Provider } from 'ethers'
import Web3Modal from 'web3modal'
import detectEthereumProvider from '@metamask/detect-provider'
import { whenDefined } from '@devprotocol/util-ts'

export const GetModalProvider = () => {
  const modalProvider = new Web3Modal({
    providerOptions: {
      injected: {
        package: detectEthereumProvider(),
      },
    },
    cacheProvider: true,
  })
  return modalProvider
}

export const ReConnectWallet = async (modalProvider: any) => {
  const web3ForInjected = await detectEthereumProvider()
  if (!web3ForInjected) {
    modalProvider.clearCachedProvider()
    return {
      currentAddress: undefined,
      connectedProvider: undefined,
      provider: undefined,
    }
  }

  if (
    modalProvider.cachedProvider === 'injected' &&
    (web3ForInjected as any).selectedAddress
  ) {
    return EthersProviderFrom(modalProvider)
  }

  return {
    currentAddress: undefined,
    connectedProvider: undefined,
    provider: undefined,
  }
}

export const EthersProviderFrom = async (modalProvider: any) => {
  const connectedProvider: Eip1193Provider = await modalProvider.connect()
  const newProvider = whenDefined(
    connectedProvider,
    (p) => new BrowserProvider(p),
  )

  const currentAddress = await (await newProvider?.getSigner())?.getAddress()
  return { currentAddress, connectedProvider, provider: newProvider }
}

export const Disconnect = (modalProvider: any) => {
  modalProvider?.clearCachedProvider()
}
