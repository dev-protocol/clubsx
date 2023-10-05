import React, { useState, useEffect } from 'react'

import { tokenInfo } from '@constants/common'
import { address, defaultAddress, withdrawContractAbi } from './utils/withdraw'
import {
  type Contract,
  type Signer,
  formatUnits,
  ZeroAddress,
  ethers,
} from 'ethers'

type Props = {
  chainId: number
  propertyAddress: string
  isYourWithdrawable: boolean
  fetcherType: 'your' | 'total' | 'cumulative'
}

const CurrencyMembershipInfo = (props: Props) => {
  const [signer, setSigner] = useState<Signer>()
  const [isClaiming, setIsClaiming] = useState<boolean>()
  const [withdrawable, setWithdrawable] = useState<string>()
  const [connection, setConnection] = useState<any>(undefined)
  const [isFetchingData, setIsFetchingData] = useState<boolean>()
  const [withdrawContract, setWithdrawContract] = useState<Contract>()

  useEffect(() => {
    const checkConnection = async () => {
      const _connection = await import('@devprotocol/clubs-core/connection')
      setConnection(_connection)
    }

    checkConnection()
  }, [props])

  useEffect(() => {
    if (!connection) {
      return
    }

    setSigner(connection.connection().signer.getValue())
    connection.connection().signer.subscribe((s: Signer) => setSigner(s))
  }, [connection])

  useEffect(() => {
    if (!signer) {
      return
    }

    const withdrawContractAddress =
      address.find((a) => a.chainId === props.chainId)?.address ||
      defaultAddress.address

    setWithdrawContract(
      new ethers.Contract(withdrawContractAddress, withdrawContractAbi, signer),
    )
  }, [signer])

  useEffect(() => {
    fetchWithdrawable()
  }, [withdrawContract])

  const fetchWithdrawable = async () => {
    if (!props.chainId || !withdrawContract || !signer) {
      return
    }

    if (props.fetcherType === 'your') {
      const response = await await withdrawContract.calculateRewardAmount(
        props.propertyAddress,
        await signer.getAddress(),
      )
      const fee: bigint = BigInt(response._amount || response[0])
      const withdrawableAmt = formatUnits(
        fee,
        tokenInfo['DEV'][props.chainId].decimals,
      )
      setWithdrawable(withdrawableAmt)
    } else if (props.fetcherType === 'cumulative') {
      const response = await await withdrawContract.calculateRewardAmount(
        props.propertyAddress,
      )
      const fee: bigint = BigInt(response._amount || response[0])
      const withdrawableAmt = formatUnits(
        fee,
        tokenInfo['DEV'][props.chainId].decimals,
      )
      setWithdrawable(withdrawableAmt)
    } else {
      setWithdrawable('0')
    }
  }

  const claimWithdrawable = async () => {
    if (
      !props.chainId ||
      !signer ||
      !props.propertyAddress ||
      !withdrawContract ||
      props.fetcherType !== 'your'
    ) {
      return
    }

    setIsClaiming(true)
    const txReceipt = await withdrawContract.withdraw(props.propertyAddress)
    await txReceipt.wait(1) // TODO: detect success failure
    setIsClaiming(false)
  }

  return (
    <section className="mt-[18px] flex items-center justify-between gap-[18px]">
      <p className="w-[23%] text-4xl font-bold">
        {new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 3,
        }).format(Number(withdrawable) || 0)}
      </p>
      <p className="grow text-base font-bold opacity-50">DEV</p>
      <button
        disabled={!Number(withdrawable)}
        onClick={claimWithdrawable}
        className={`hs-button is-filled w-[27%] px-[22px] py-3.5 ${
          props.isYourWithdrawable ? '' : 'invisible'
        }`}
      >
        Withdraw DEV
      </button>
    </section>
  )
}

export default CurrencyMembershipInfo
