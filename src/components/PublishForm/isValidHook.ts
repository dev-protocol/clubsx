import type { UndefinedOr } from '@devprotocol/util-ts'
import { useCallback, useEffect, useState } from 'react'
import {
  clientsPropertyFactory,
  createPropertyContract,
} from '@devprotocol/dev-kit'
import { isAddress, type ContractRunner, type Signer } from 'ethers'

export const useIsValidPropertyAddress = (
  signer: UndefinedOr<Signer>,
  tokenizedPropertyAddr: string,
  provider: UndefinedOr<ContractRunner>,
) => {
  const [isValid, setIsValid] = useState<boolean>(false)

  const fetchValidity = useCallback(async () => {
    if (!provider || !signer) {
      console.log('Provider or signer not found!')
      setIsValid(false)
      return
    }

    const isValidEVMAddr = isAddress(tokenizedPropertyAddr)
    if (!isValidEVMAddr) {
      console.error('Invalid EVM address!')
      setIsValid(false)
      return
    }

    const [l1, l2] = await clientsPropertyFactory(provider)
    const client = l1 ?? l2
    const isProperty = await client
      ?.contract()
      ?.isProperty(tokenizedPropertyAddr)
    if (!isProperty) {
      console.error('Invalid proprety address!')
      setIsValid(false)
      return
    }

    const eoa = await signer?.getAddress()
    const propertyContract = createPropertyContract(provider)(
      tokenizedPropertyAddr,
    )
    const owner = await propertyContract?.author()
    const isAuthor = (await propertyContract?.author()) === eoa
    if (!isAuthor) {
      console.error('Connected wallet is not author of the token!')
      setIsValid(false)
      return
    }

    setIsValid(isProperty && isAuthor)
  }, [provider, tokenizedPropertyAddr])

  useEffect(() => {
    fetchValidity().catch((err) =>
      console.log(`Failed to fetch custom token validity: ${err.stack}`),
    )
  }, [provider, tokenizedPropertyAddr])

  return isValid
}
