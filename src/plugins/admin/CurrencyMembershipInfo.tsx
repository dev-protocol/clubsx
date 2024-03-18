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
  isKYCVerified: boolean
}

const CurrencyMembershipInfo = (props: Props) => {
  const [signer, setSigner] = useState<Signer>()
  const [isClaiming, setIsClaiming] = useState<boolean>()
  const [withdrawable, setWithdrawable] = useState<string>()
  const [connection, setConnection] = useState<any>(undefined)
  const [isFetchingData, setIsFetchingData] = useState<boolean>()
  const [claimBtnTxt, setClaimBtnTxt] = useState<string>(
    `Withdraw ${props.currency}`,
  )
  const [withdrawableInDollars, setWithdrawableInDollars] = useState<string>()
  const [swapAndStakeContract, setSwapAndStakeContract] = useState<Contract>()
  const [dataOfPriceAPI, setDataOfPriceAPI] = useState<{
    price: number
    error?: Error
  }>()

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
    const connectionSub = connection
      .connection()
      .signer.subscribe((s: Signer) => setSigner(s))
    return () => connectionSub.unsubscribe() // Cleanup to remove pervious subscribers.
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
  }, [
    swapAndStakeContract,
    dataOfPriceAPI?.price,
    props.currency,
    props.chainId,
  ])

  useEffect(() => {
    usdByCurrency(
      1,
      tokenInfo[props.currency][props.chainId].coingeckoCurrencyId,
    ).then(setDataOfPriceAPI)
  }, [props.currency, props.chainId])

  const fetchWithdrawable = async () => {
    if (!props.chainId || !swapAndStakeContract || !signer || !dataOfPriceAPI) {
      return
    }

    setIsFetchingData(true)
    const tokenAddress = tokenInfo[props.currency][props.chainId].address

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
        Number(withdrawableAmt) * dataOfPriceAPI.price
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
        Number(withdrawableAmt) * dataOfPriceAPI.price
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
    setClaimBtnTxt('Processing...')
    const tokenAddress = tokenInfo[tokenSymbol][props.chainId].address
    const txReceipt = await swapAndStakeContract.claim(tokenAddress)
    await txReceipt.wait(1)
    fetchWithdrawable()
    setIsClaiming(false)
    setClaimBtnTxt(`Withdraw ${props.currency}`)
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
        {dataOfPriceAPI?.error
          ? '(N/A)'
          : new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 3,
            }).format(Number(withdrawableInDollars) || 0)}
      </p>
      <button
        onClick={() => claimWithdrawable(props.currency)}
        disabled={!props.isKYCVerified || !Number(withdrawable) || isClaiming}
        className={`hs-button is-filled col-span-2 ${
          !props.isKYCVerified
            ? 'disabled:cursor-not-allowed disabled:hover:animate-[horizontal-shaking_.06s_5]'
            : ''
        } lg:col-span-1 ${props.isYourWithdrawable ? '' : 'invisible'} ${
          isClaiming ? 'animate-pulse bg-dp-blue-grey-600' : ''
        }`}
      >
        {claimBtnTxt}
      </button>
    </section>
  )
}

export default CurrencyMembershipInfo
