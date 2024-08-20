import type { UndefinedOr } from '@devprotocol/util-ts'
import { useCallback, useEffect, useState } from 'react'
import {
  clientsPropertyFactory,
  createPropertyContract,
} from '@devprotocol/dev-kit'
import { isAddress, type ContractRunner, type Signer } from 'ethers'

export enum VALIDITY_STATE {
  UNDEFINED,
  VALID,
  INVALID_ADDR,
  INVALID_PROPERTY_ADDR,
  NOT_PROPERTY_OWNER,
}

export const useIsValidPropertyAddress = (
  signer: UndefinedOr<Signer>,
  tokenizedPropertyAddr: string,
  provider: UndefinedOr<ContractRunner>,
) => {
  const [validity, setValidity] = useState<VALIDITY_STATE>(
    VALIDITY_STATE.UNDEFINED,
  )

  const fetchValidity = useCallback(async () => {
    if (!tokenizedPropertyAddr) {
      console.log('Invalid token address or address not entered!')
      setValidity(VALIDITY_STATE.UNDEFINED)
      return
    }

    if (!provider || !signer) {
      console.log('Provider or signer not found!')
      setValidity(VALIDITY_STATE.UNDEFINED)
      return
    }

    const isValidEVMAddr = isAddress(tokenizedPropertyAddr)
    if (!isValidEVMAddr) {
      console.error('Invalid EVM address!')
      setValidity(VALIDITY_STATE.INVALID_ADDR)
      return
    }

    const [l1, l2] = await clientsPropertyFactory(provider)
    const client = l1 ?? l2
    const isProperty = await client
      ?.contract()
      ?.isProperty(tokenizedPropertyAddr)
    if (!isProperty) {
      console.error('Invalid proprety address!')
      setValidity(VALIDITY_STATE.INVALID_PROPERTY_ADDR)
      return
    }

    const eoa = await signer?.getAddress()
    const propertyContract = createPropertyContract(provider)(
      tokenizedPropertyAddr,
    )
    const isAuthor = (await propertyContract?.author()) === eoa
    if (!isAuthor) {
      console.error('Connected wallet is not author of the token!')
      setValidity(VALIDITY_STATE.NOT_PROPERTY_OWNER)
      return
    }

    setValidity(
      isProperty && isAuthor ? VALIDITY_STATE.VALID : VALIDITY_STATE.UNDEFINED,
    )
  }, [provider, tokenizedPropertyAddr])

  useEffect(() => {
    fetchValidity().catch((err) =>
      console.log(`Failed to fetch custom token validity: ${err.stack}`),
    )
  }, [provider, tokenizedPropertyAddr])

  return validity
}
