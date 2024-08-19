import { isAddress, type ContractRunner, type Signer } from 'ethers'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { useCallback, useEffect, useState } from 'react'
import {
  clientsPropertyFactory,
  createPropertyContract,
} from '@devprotocol/dev-kit'

export const useIsValidDevProtocolProperty = (
  provider: UndefinedOr<ContractRunner>,
  tokenizedPropertyAddr: string,
) => {
  const [isValid, setIsValid] = useState<boolean>(false)

  const fetchValidity = useCallback(async () => {
    if (!provider) {
      setIsValid(false)
      return
    }

    const isValidEVMAddr = isAddress(tokenizedPropertyAddr)
    if (!isValidEVMAddr) {
      console.error('Invalid EVM address')
      setIsValid(false)
      return
    }

    const [l1, l2] = await clientsPropertyFactory(provider)
    const client = l1 ?? l2
    setIsValid(await client?.contract().isProperty(tokenizedPropertyAddr))
  }, [provider, tokenizedPropertyAddr])

  useEffect(() => {
    fetchValidity().catch((err) =>
      console.log(`Failed to fetch custom token validity: ${err.stack}`),
    )
  }, [provider, tokenizedPropertyAddr])

  return isValid
}

export const useIsOwnerOfValidDevProtocolProperty = (
  signer: UndefinedOr<Signer>,
  tokenizedPropertyAddr: string,
  provider: UndefinedOr<ContractRunner>,
  useIsValidDevProtocolProperty: boolean,
) => {
  const [isOwner, setIsOwner] = useState<boolean>(false)

  const fetchOwner = useCallback(async () => {
    if (!provider || !signer) {
      console.log('Provider or signer is not set!')
      setIsOwner(false)
      return
    }

    if (!useIsValidDevProtocolProperty) {
      console.error(
        'Invalid EVM address or token not created on DEV Protocol ecosystem!',
      )
      setIsOwner(false)
      return
    }

    const eoa = await signer?.getAddress()
    const propertyContract = createPropertyContract(provider)(
      tokenizedPropertyAddr,
    )
    setIsOwner((await propertyContract?.author()) === eoa)
  }, [provider, tokenizedPropertyAddr])

  useEffect(() => {
    fetchOwner().catch((err) =>
      console.log(`Failed to fetch custom token owner: ${err.stack}`),
    )
  }, [provider, tokenizedPropertyAddr])

  return isOwner
}
