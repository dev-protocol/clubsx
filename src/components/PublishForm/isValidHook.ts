import { isAddress, type ContractRunner } from 'ethers'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { useCallback, useEffect, useState } from 'react'
import { clientsPropertyFactory } from '@devprotocol/dev-kit'

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
