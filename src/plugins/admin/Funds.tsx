import React, { useEffect, useState } from 'react'
import type { UndefinedOr } from '@devprotocol/util-ts'

import StakeInfo from './StakeInfo'
import { KYCStatuses } from './Withdrawal'
import { ALL_CURRENCIES } from '@constants/memberships'
import CurrencyMembershipInfo from './CurrencyMembershipInfo'

const FundsInfo = (props: {
  vaultAddress: UndefinedOr<string>
  propertyAddress: string
  chainId: number
  uniqueBeneficiaries: string[]
  KYCStatus: KYCStatuses
}) => {
  const [connection, setConnection] = useState<any>(undefined)
  const [currentAddress, setCurrentAddress] = useState<string>()
  const [totalWithrawableInDollars, setTotalWithdrawableInDollars] = useState<
    string[]
  >(Array(ALL_CURRENCIES.length).fill(0))
  const [yourTotalWithdrawableInDollars, setYourTotalWithdrawableInDollars] =
    useState<string[]>(Array(ALL_CURRENCIES.length).fill(0))

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

    setCurrentAddress(connection.connection().account.getValue())
    connection.connection().account.subscribe((a: string) => {
      setCurrentAddress(a)
    })
  }, [connection])

  const updateYourTotalWithdrawable = (
    allCurrencyIndex: number,
    nonFormattedNumberString: string,
  ) => {
    setYourTotalWithdrawableInDollars((yourTotalWithdrawableInDollars) => [
      ...yourTotalWithdrawableInDollars.slice(0, allCurrencyIndex),
      nonFormattedNumberString,
      ...yourTotalWithdrawableInDollars.slice(allCurrencyIndex + 1),
    ])
  }

  const updateTotalWithdrawable = (
    allCurrencyIndex: number,
    nonFormattedNumberString: string,
  ) => {
    setTotalWithdrawableInDollars((totalWithrawableInDollars) => [
      ...totalWithrawableInDollars.slice(0, allCurrencyIndex),
      nonFormattedNumberString,
      ...totalWithrawableInDollars.slice(allCurrencyIndex + 1),
    ])
  }

  return (
    <>
      {/* <!-- Clubs vault section --> */}
      <div>
        <p className="text-3xl font-bold">Clubs Vault</p>

        {/* <!-- Your withdrawable funds --> */}
        <div className="mt-8 w-full max-w-full rounded-2xl border border-dp-blue-grey-300 p-4 dark:border-dp-blue-grey-200 lg:p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Your withdrawable funds
          </p>
          <section className="mt-5 flex items-center gap-5">
            <p className="text-4xl">
              $
              {new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 3,
              }).format(
                Number(
                  yourTotalWithdrawableInDollars.reduce(
                    (prev: string, curr: string) =>
                      String(Number(prev) + Number(curr)),
                  ),
                ) || 0,
              )}
            </p>
            <p className="w-fit text-base font-bold opacity-50">
              equivalent tokens
            </p>
          </section>
          {ALL_CURRENCIES.map((curr, id) => (
            <CurrencyMembershipInfo
              key={`${curr}:=:${id}`}
              chainId={props.chainId}
              currency={curr}
              allCurrencyIndex={id}
              isYourWithdrawable={true}
              uniqueBeneficiaries={[]}
              updateWithdrawableInDollars={updateYourTotalWithdrawable}
              isKYCVerified={KYCStatuses.VERIFIED === props.KYCStatus}
            />
          ))}
        </div>

        {/* <!-- Total withdrawable funds --> */}
        <div className="mt-8 w-full max-w-full rounded-2xl border border-dp-blue-grey-300 p-4 dark:border-dp-blue-grey-200 lg:p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Total withdrawable funds
          </p>
          <section className="mt-5 flex items-center gap-5">
            <p className="text-2xl">
              $
              {new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 3,
              }).format(
                Number(
                  totalWithrawableInDollars.reduce(
                    (prev: string, curr: string) =>
                      String(Number(prev) + Number(curr)),
                  ),
                ) || 0,
              )}
            </p>
            <p className="w-fit text-base font-bold opacity-50">
              equivalent tokens
            </p>
          </section>
          {ALL_CURRENCIES.map((curr, id) => (
            <CurrencyMembershipInfo
              key={`${curr}:=:${id}`}
              chainId={props.chainId}
              currency={curr}
              allCurrencyIndex={id}
              isYourWithdrawable={false}
              uniqueBeneficiaries={props.uniqueBeneficiaries}
              updateWithdrawableInDollars={updateTotalWithdrawable}
              isKYCVerified={false}
            />
          ))}
        </div>
      </div>

      {/* <!-- Direct payments section --> */}
      <div>
        <p className="text-3xl font-bold">Direct Payments</p>

        {/* <!-- Your withdrawable funds --> */}
        <div className="mt-8 w-full max-w-full rounded-2xl border border-dp-blue-grey-300 p-4 dark:border-dp-blue-grey-200 lg:p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Your withdrawable funds
          </p>
          <section className="mt-5 flex items-center gap-5">
            <p className="text-4xl">
              $
              {new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 3,
              }).format(
                Number(
                  yourTotalWithdrawableInDollars.reduce(
                    (prev: string, curr: string) =>
                      String(Number(prev) + Number(curr)),
                  ),
                ) || 0,
              )}
            </p>
            <p className="w-fit text-base font-bold opacity-50">
              equivalent tokens
            </p>
          </section>
          {ALL_CURRENCIES.map((curr, id) => (
            <CurrencyMembershipInfo
              key={`${curr}:=:${id}`}
              chainId={props.chainId}
              currency={curr}
              allCurrencyIndex={id}
              isYourWithdrawable={true}
              uniqueBeneficiaries={[]}
              updateWithdrawableInDollars={updateYourTotalWithdrawable}
              isKYCVerified={KYCStatuses.VERIFIED === props.KYCStatus}
            />
          ))}
        </div>

        {/* <!-- Total withdrawable funds --> */}
        <div className="mt-8 w-full max-w-full rounded-2xl border border-dp-blue-grey-300 p-4 dark:border-dp-blue-grey-200 lg:p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Total withdrawable funds
          </p>
          <section className="mt-5 flex items-center gap-5">
            <p className="text-2xl">
              $
              {new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 3,
              }).format(
                Number(
                  totalWithrawableInDollars.reduce(
                    (prev: string, curr: string) =>
                      String(Number(prev) + Number(curr)),
                  ),
                ) || 0,
              )}
            </p>
            <p className="w-fit text-base font-bold opacity-50">
              equivalent tokens
            </p>
          </section>
          {ALL_CURRENCIES.map((curr, id) => (
            <CurrencyMembershipInfo
              key={`${curr}:=:${id}`}
              chainId={props.chainId}
              currency={curr}
              allCurrencyIndex={id}
              isYourWithdrawable={false}
              uniqueBeneficiaries={props.uniqueBeneficiaries}
              updateWithdrawableInDollars={updateTotalWithdrawable}
              isKYCVerified={false}
            />
          ))}
        </div>
      </div>

      {/* <!-- Staking --> */}
      <div>
        <p className="text-3xl font-bold">Staking</p>

        {/* <!-- Your withdrawable funds --> */}
        <div className="mt-8 w-full max-w-full rounded-2xl border border-dp-blue-grey-300 p-4 dark:border-dp-blue-grey-200 lg:p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Your withdrawable funds
          </p>
          <StakeInfo
            fetcherType={'your'}
            chainId={props.chainId}
            isYourWithdrawable={true}
            propertyAddress={props.propertyAddress}
            isKYCVerified={KYCStatuses.VERIFIED === props.KYCStatus}
          />
        </div>

        {/* <!-- Total withdrawable funds --> */}
        {/* <div className="mt-8 w-full max-w-full border-[1px] rounded-2xl p-8 border-[#3A4158] bg-[#3A4158]">
          <p className="w-fit font-bold text-base opacity-50">Total withdrawable funds</p>

          {#each Array(1) as _, index (index)}
            <section className="mt-5 flex items-center gap-5 justify-between">
              <p className="w-[23%] font-bold text-2xl">32.200</p>
              <p className="grow font-bold text-base opacity-50">DEV</p>
            </section>
          {/each}
        </div> */}

        {/* <!-- Cumulative funds --> */}
        <div className="mt-8 w-full max-w-full rounded-2xl border border-dp-blue-grey-300 p-4 dark:border-dp-blue-grey-200 lg:p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Cumulative funds
          </p>

          <StakeInfo
            chainId={props.chainId}
            fetcherType={'cumulative'}
            isYourWithdrawable={false}
            propertyAddress={props.propertyAddress}
            isKYCVerified={false}
          />
        </div>
      </div>
    </>
  )
}

export default FundsInfo
