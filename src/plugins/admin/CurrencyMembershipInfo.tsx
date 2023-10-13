import React, { useState, useEffect } from 'react'

import { tokenInfo } from '@constants/common'
import { usdByCurrency } from '@fixtures/coingecko/api'
import { ethers, type Contract, type Signer, formatUnits } from 'ethers'
import {
  address,
  defaultAddress,
  swapAndStakeAddressAbi,
} from './utils/swapAndStake'
import './assets/animation.css'

type Props = {
  chainId: number
  currency: string
  allCurrencyIndex: number
  isYourWithdrawable: boolean
  uniqueBeneficiaries: string[]
  updateWithdrawableInDollars: (allCurrencyIndex: number, value: string) => void
}

const CurrencyMembershipInfo = (props: Props) => {
  const [signer, setSigner] = useState<Signer>()
  const [isClaiming, setIsClaiming] = useState<boolean>()
  const [withdrawable, setWithdrawable] = useState<string>()
  const [connection, setConnection] = useState<any>(undefined)
  const [isFetchingData, setIsFetchingData] = useState<boolean>()
  const [withdrawableInDollars, setWithdrawableInDollars] = useState<string>()
  const [swapAndStakeContract, setSwapAndStakeContract] = useState<Contract>()

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
    const swapAndStakeAddress =
      address.find((a) => a.chainId === props.chainId)?.address ||
      defaultAddress.address

    setSwapAndStakeContract(
      new ethers.Contract(swapAndStakeAddress, swapAndStakeAddressAbi, signer),
    )
  }, [signer])

  useEffect(() => {
    fetchWithdrawable()
  }, [swapAndStakeContract])

  const fetchWithdrawable = async () => {
    if (!props.chainId || !swapAndStakeContract || !signer) {
      return
    }

    setIsFetchingData(true)
    const tokenAddress = tokenInfo[props.currency][props.chainId].address
    const coinGeckoCurrencyId =
      tokenInfo[props.currency][props.chainId].coingeckoCurrencyId

    let withdrawableAmt: string = '0'
    let withdrawableAmtInDollars: string = '0'
    if (props.isYourWithdrawable) {
      const currentAddress = await signer.getAddress()
      const fee: bigint = BigInt(
        await swapAndStakeContract.gatewayFees(currentAddress, tokenAddress),
      )

      withdrawableAmt = formatUnits(
        fee,
        tokenInfo[props.currency][props.chainId].decimals,
      )
      withdrawableAmtInDollars = (
        await usdByCurrency(Number(withdrawableAmt), coinGeckoCurrencyId)
      ).toString()
    } else {
      let totalWithdrawable: bigint = BigInt('0')
      for (const beneficiary of props.uniqueBeneficiaries) {
        const fee: bigint = BigInt(
          await swapAndStakeContract.gatewayFees(beneficiary, tokenAddress),
        )
        totalWithdrawable = totalWithdrawable + fee
      }

      withdrawableAmt = formatUnits(
        totalWithdrawable,
        tokenInfo[props.currency][props.chainId].decimals,
      )
      withdrawableAmtInDollars = (
        await usdByCurrency(Number(withdrawableAmt), coinGeckoCurrencyId)
      ).toString()
    }

    setWithdrawable(withdrawableAmt)
    setWithdrawableInDollars(withdrawableAmtInDollars)
    props.updateWithdrawableInDollars(
      props.allCurrencyIndex,
      withdrawableAmtInDollars,
    )
    setIsFetchingData(false)
  }

  const claimWithdrawable = async (tokenSymbol: string) => {
    if (
      !props.chainId ||
      !signer ||
      !swapAndStakeContract ||
      !props.isYourWithdrawable
    ) {
      return
    }

    setIsClaiming(true)
    const tokenAddress = tokenInfo[tokenSymbol][props.chainId].address
    const txReceipt = await swapAndStakeContract.claim(tokenAddress)
    await txReceipt.wait(1) // TODO: detect success failure
    setIsClaiming(false)
  }

  return (
    <section className="mt-5 grid grid-cols-2 grid-rows-2 items-center justify-between gap-5 lg:grid-cols-[2fr_3fr_2fr] lg:grid-rows-1">
      <p className="text-base font-bold">
        {new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 3,
        }).format(Number(withdrawable) || 0)}{' '}
        {props.currency}
      </p>
      <p className="text-base font-bold opacity-50">
        ≈ $
        {new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 3,
        }).format(Number(withdrawableInDollars) || 0)}
      </p>
      <button
        onClick={() => claimWithdrawable(props.currency)}
        disabled={true || !Number(withdrawable)} // TODO: temporary disabled until kyc is in place.
        className={`hs-button is-filled col-span-2 disabled:cursor-not-allowed disabled:hover:animate-[horizontal-shaking_.06s_5] lg:col-span-1 ${
          props.isYourWithdrawable ? '' : 'invisible'
        }`}
      >
        Withdraw {props.currency}
      </button>
    </section>
  )
}

export default CurrencyMembershipInfo
