import React, { useEffect, useState } from 'react'

import { ALL_CURRENCIES } from '@constants/memberships'
import CurrencyMembershipInfo from './CurrencyMembershipInfo'
import NotVerifiedBannerImg from './assets/NotVerifiedBannerImg.svg'

const FundsInfo = (props: {
  chainId: number
  uniqueBeneficiaries: string[]
}) => {
  const [currentAddress, setCurrentAddress] = useState<string>()
  const [connection, setConnection] = useState<any>(undefined)

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

  return (
    <div className="grid gap-16">
      {/* <!------ Loggin/Connection status --------------> */}
      {!currentAddress && (
        <div className="mb-16 flex w-fit max-w-full items-center justify-center gap-[18px] rounded-md bg-[#FDAD00] px-8 py-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.9825 16.725C15.2838 15.7999 14.3798 15.0496 13.3417 14.5334C12.3036 14.0171 11.1599 13.7489 10.0005 13.75C8.84115 13.7489 7.69739 14.0171 6.65932 14.5334C5.62125 15.0496 4.71724 15.7999 4.0185 16.725M15.9825 16.725C17.346 15.5122 18.3076 13.9136 18.7417 12.1411C19.1758 10.3686 19.0608 8.50609 18.412 6.80048C17.7632 5.09487 16.6112 3.62678 15.1089 2.5909C13.6066 1.55502 11.8248 1.00029 10 1.00029C8.17516 1.00029 6.39343 1.55502 4.89111 2.5909C3.38878 3.62678 2.23683 5.09487 1.58804 6.80048C0.939242 8.50609 0.824253 10.3686 1.25832 12.1411C1.69239 13.9136 2.655 15.5122 4.0185 16.725M15.9825 16.725C14.3365 18.1932 12.2061 19.0031 10.0005 19C7.79453 19.0034 5.66474 18.1934 4.0185 16.725M13.0005 7.75C13.0005 8.54565 12.6844 9.30871 12.1218 9.87132C11.5592 10.4339 10.7962 10.75 10.0005 10.75C9.20485 10.75 8.44179 10.4339 7.87918 9.87132C7.31657 9.30871 7.0005 8.54565 7.0005 7.75C7.0005 6.95435 7.31657 6.19129 7.87918 5.62868C8.44179 5.06607 9.20485 4.75 10.0005 4.75C10.7962 4.75 11.5592 5.06607 12.1218 5.62868C12.6844 6.19129 13.0005 6.95435 13.0005 7.75Z"
              stroke={currentAddress ? 'white' : 'black'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-black">Not connected to a wallet</p>
        </div>
      )}

      {/* <!-- Banner --> */}
      <div className="w-full max-w-full gap-[18px] rounded-[18px] border-[1px] border-[#3A4158] bg-[#3A4158] px-8 py-[82px]">
        <p className="text-center font-body text-[32px]">
          Clubs KYC will be available soon...
        </p>
        <div className="mx-auto mt-[18px] flex w-fit max-w-full items-center justify-center gap-[18px]">
          <div className="w-fit max-w-[52.2%] rounded-lg bg-[#6D9BFF] p-[19px]">
            <img src={NotVerifiedBannerImg.src} alt="Not verified" />
          </div>
          <p className="font-body text-base font-bold opacity-50">
            Not verified
          </p>
        </div>
        <p className="mt-[18px] text-center font-body text-xl">
          Clubs applies eKYC to fund withdrawals to help you build a secure and
          robust community. Once the process is successfully completed, you will
          be able to withdraw funds and the Clubs team is committed to building
          the eKYC process.
        </p>
      </div>

      {/* <!-- Memberships/NFT section --> */}
      <div>
        <p className="text-[32px] font-bold">Memberships/NFTs</p>

        {/* <!-- Your withdrawable funds --> */}
        <div className="mt-8 w-full max-w-full rounded-[18px] border-[1px] border-[#3A4158] bg-[#3A4158] p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Your withdrawable funds
          </p>
          <section className="mt-[18px] flex items-center gap-[18px]">
            <p className="text-4xl">$32.200</p>
            <p className="w-fit text-base font-bold opacity-50">
              equivalent tokens
            </p>
          </section>
          {ALL_CURRENCIES.map((curr, id) => (
            <CurrencyMembershipInfo
              key={`${curr}:=:${id}`}
              chainId={props.chainId}
              currency={curr}
              isYourWithdrawable={true}
              uniqueBeneficiaries={[]}
            />
          ))}
        </div>

        {/* <!-- Total withdrawable funds --> */}
        <div className="mt-8 w-full max-w-full rounded-[18px] border-[1px] border-[#3A4158] bg-[#3A4158] p-8">
          <p className="w-fit text-base font-bold opacity-50">
            Total withdrawable funds
          </p>
          <section className="mt-[18px] flex items-center gap-[18px]">
            <p className="text-2xl">$32.200</p>
            <p className="w-fit text-base font-bold opacity-50">
              equivalent tokens
            </p>
          </section>
          {ALL_CURRENCIES.map((curr, id) => (
            <CurrencyMembershipInfo
              key={`${curr}:=:${id}`}
              chainId={props.chainId}
              currency={curr}
              isYourWithdrawable={false}
              uniqueBeneficiaries={props.uniqueBeneficiaries}
            />
          ))}
        </div>
      </div>

      {/* <!-- Staking --> */}
      {/* <div>
        <p className="font-bold text-[32px]">Staking</p>

        <!-- Your withdrawable funds -->
        <div className="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
          <p className="w-fit font-bold text-base opacity-50">Your withdrawable funds</p>

          {#each Array(1) as _, index (index)}
            <section className="mt-[18px] flex items-center gap-[18px] justify-between">
              <p className="w-[23%] font-bold text-4xl">32.200</p>
              <p className="grow font-bold text-base opacity-50">DEV</p>
              <button
                disabled={true}
                className="hs-button is-filled w-fit py-3.5 px-[22px] ">Withdraw DEV</button>
            </section>
          {/each}
        </div> */}

      {/* <!-- Total withdrawable funds -->
        <div className="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
          <p className="w-fit font-bold text-base opacity-50">Total withdrawable funds</p>

          {#each Array(1) as _, index (index)}
            <section className="mt-[18px] flex items-center gap-[18px] justify-between">
              <p className="w-[23%] font-bold text-2xl">32.200</p>
              <p className="grow font-bold text-base opacity-50">DEV</p>
            </section>
          {/each}
        </div> */}

      {/* <!-- Cumulative funds -->
        <div className="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
          <p className="w-fit font-bold text-base opacity-50">Cumulative funds</p>

          {#each Array(1) as _, index (index)}
            <section className="mt-[18px] flex items-center gap-[18px] justify-between">
              <p className="w-[23%] font-bold text-2xl">32.200</p>
              <p className="grow font-bold text-base opacity-50">DEV</p>
            </section>
          {/each}
        </div>
      </div> */}
    </div>
  )
}

export default FundsInfo
