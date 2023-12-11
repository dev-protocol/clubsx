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
import {
  address as lockupAddress,
  defaultAddress as defaultLockupAddress,
  lockupContractAbi,
} from './utils/lockup'
import './assets/animation.css'

type Props = {
  chainId: number
  propertyAddress: string
  isYourWithdrawable: boolean
  fetcherType: 'your' | 'total' | 'cumulative'
  isKYCVerified: boolean
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

    if (props.fetcherType === 'your' || props.fetcherType === 'total') {
      // TODO: remove total from here and add in else.
      const withdrawContractAddress =
        address.find((a) => a.chainId === props.chainId)?.address ||
        defaultAddress.address

      setWithdrawContract(
        new ethers.Contract(
          withdrawContractAddress,
          withdrawContractAbi,
          signer,
        ),
      )
    } else if (props.fetcherType === 'cumulative') {
      const lockupContractAddress =
        lockupAddress.find((a) => a.chainId === props.chainId)?.address ||
        defaultLockupAddress.address

      setWithdrawContract(
        new ethers.Contract(lockupContractAddress, lockupContractAbi, signer),
      )
    }
  }, [signer, props])

  useEffect(() => {
    fetchWithdrawable()
  }, [withdrawContract])

  const fetchWithdrawable = async () => {
    if (!props.chainId || !withdrawContract || !signer) {
      return
    }

    let withdrawableAmt: string = '0'
    if (props.fetcherType === 'your') {
      const response = await withdrawContract.calculateRewardAmount(
        props.propertyAddress,
        await signer.getAddress(),
      )
      const fee: bigint = BigInt(response._amount || response[0])
      withdrawableAmt = formatUnits(fee, 36)
    } else if (props.fetcherType === 'cumulative') {
      const response = await await withdrawContract.calculateRewardAmount(
        props.propertyAddress,
      )
      const fee: bigint = BigInt(response._amount || response[0])
      withdrawableAmt = formatUnits(fee, 36)
    } else {
      withdrawableAmt = '0'
    }

    setWithdrawable(withdrawableAmt)
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
    <section className="mt-5 grid grid-cols-2 grid-rows-2 items-center justify-between gap-5 lg:grid-cols-[2fr_3fr_2fr] lg:grid-rows-1">
      <p className="text-4xl font-bold">
        {new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 3,
        }).format(Number(withdrawable) || 0)}
      </p>
      <p className="text-base font-bold opacity-50">DEV</p>
      <button
        disabled={!props.isKYCVerified || !Number(withdrawable)}
        onClick={claimWithdrawable}
        className={`hs-button is-filled col-span-2 ${
          !props.isKYCVerified
            ? 'disabled:cursor-not-allowed disabled:hover:animate-[horizontal-shaking_.06s_5]'
            : ''
        } lg:col-span-1 ${props.isYourWithdrawable ? '' : 'invisible'}`}
      >
        Withdraw DEV
      </button>
    </section>
  )
}

export default CurrencyMembershipInfo
