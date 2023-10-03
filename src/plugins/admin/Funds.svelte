<script lang="ts">
  import { onMount } from 'svelte'
  import type { Membership } from '@plugins/memberships'
  import { ALL_CURRENCIES } from '@constants/memberships'
  import { ZeroAddress, type Signer, type ContractRunner } from 'ethers'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  import CurrencyMembershipInfo from './CurrencyMembershipInfo.svelte'
  import NotVerifiedBannerImg from './assets/NotVerifiedBannerImg.svg'

  let signer: Signer | undefined
  let connection: typeof Connection
  let currentAddress: string | undefined
  let provider: ContractRunner | undefined
  let allBeneficiaries: string[] = []

  export let chainId: number
  export let memberships: Membership[] = []

  onMount(async () => {
    await connectOnMount()
    setAllBeneficiaries()
  })

  const setAllBeneficiaries = () => {
    if (!memberships || !memberships.length) return

    let beneficiaries: string[] = []
    for (const membership of memberships) {
      beneficiaries.push(membership.fee?.beneficiary ?? ZeroAddress)
    }

    allBeneficiaries = new Array(...new Set(beneficiaries))
  }

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection

    signer = connection().signer.getValue()
    provider = connection().provider.getValue()
    currentAddress = connection().account.getValue()

    connection().provider.subscribe((p) => {
      provider = p
    })
    connection().signer.subscribe((s) => {
      signer = s
    })
    connection().account.subscribe((a) => {
      currentAddress = a
    })
  }
</script>

<div class="grid gap-16">
  <!-- Wallet connection notice -->
  { #if !currentAddress }
    <div
      class="flex gap-[18px] mb-16 rounded-md w-fit max-w-full px-8 py-4 bg-[#FDAD00] justify-center items-center"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.9825 16.725C15.2838 15.7999 14.3798 15.0496 13.3417 14.5334C12.3036 14.0171 11.1599 13.7489 10.0005 13.75C8.84115 13.7489 7.69739 14.0171 6.65932 14.5334C5.62125 15.0496 4.71724 15.7999 4.0185 16.725M15.9825 16.725C17.346 15.5122 18.3076 13.9136 18.7417 12.1411C19.1758 10.3686 19.0608 8.50609 18.412 6.80048C17.7632 5.09487 16.6112 3.62678 15.1089 2.5909C13.6066 1.55502 11.8248 1.00029 10 1.00029C8.17516 1.00029 6.39343 1.55502 4.89111 2.5909C3.38878 3.62678 2.23683 5.09487 1.58804 6.80048C0.939242 8.50609 0.824253 10.3686 1.25832 12.1411C1.69239 13.9136 2.655 15.5122 4.0185 16.725M15.9825 16.725C14.3365 18.1932 12.2061 19.0031 10.0005 19C7.79453 19.0034 5.66474 18.1934 4.0185 16.725M13.0005 7.75C13.0005 8.54565 12.6844 9.30871 12.1218 9.87132C11.5592 10.4339 10.7962 10.75 10.0005 10.75C9.20485 10.75 8.44179 10.4339 7.87918 9.87132C7.31657 9.30871 7.0005 8.54565 7.0005 7.75C7.0005 6.95435 7.31657 6.19129 7.87918 5.62868C8.44179 5.06607 9.20485 4.75 10.0005 4.75C10.7962 4.75 11.5592 5.06607 12.1218 5.62868C12.6844 6.19129 13.0005 6.95435 13.0005 7.75Z" stroke={currentAddress ? 'white' : 'black'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="text-black">
          Not connected to a wallet
      </p>
    </div>
  { /if }

  <!-- Banner -->
  <div class="w-full max-w-full rounded-[18px] border-[1px] gap-[18px] py-[82px] px-8 bg-[#3A4158] border-[#3A4158]">
    <p class="font-body text-[32px] text-center">Clubs KYC will be available soon...</p>
    <div class="mt-[18px] w-fit max-w-full flex items-center justify-center gap-[18px] mx-auto">
      <div class="w-fit max-w-[52.2%] rounded-lg p-[19px] bg-[#6D9BFF]">
        <img src={NotVerifiedBannerImg.src} alt="Not verified" />
      </div>
      <p class="font-body font-bold text-base opacity-50">Not verified</p>
    </div>
    <p class="mt-[18px] font-body text-xl text-center">Clubs applies eKYC to fund withdrawals to help you build a secure and robust community. Once the process is successfully completed, you will be able to withdraw funds and the Clubs team is committed to building the eKYC process.</p>
  </div>

  <!-- Memberships/NFT section -->
  <div>
    <p class="font-bold text-[32px]">Memberships/NFTs</p>

    <!-- Your withdrawable funds -->
    <div class="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
      <p class="w-fit font-bold text-base opacity-50">Your withdrawable funds</p>
      <section class="mt-[18px] flex items-center gap-[18px]">
        <p class="text-4xl">$32.200</p>
        <p class="w-fit font-bold text-base opacity-50">equivalent tokens</p>
      </section>

      {#each ALL_CURRENCIES as currency}
        <CurrencyMembershipInfo chainId={chainId} currency={currency} signer={signer} isYourWithdrawable={true} />
      {/each}
    </div>

    <!-- Total withdrawable funds -->
    <div class="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
      <p class="w-fit font-bold text-base opacity-50">Total withdrawable funds</p>
      <section class="mt-[18px] flex items-center gap-[18px]">
        <p class="text-2xl">$32.200</p>
        <p class="w-fit font-bold text-base opacity-50">equivalent tokens</p>
      </section>

      {#each ALL_CURRENCIES as currency}
        <CurrencyMembershipInfo chainId={chainId} currency={currency} signer={signer} isYourWithdrawable={false} allBeneficiaries={allBeneficiaries ?? []} />
      {/each}
    </div>
  </div>

  <!-- Staking -->
  <div>
    <p class="font-bold text-[32px]">Staking</p>

    <!-- Your withdrawable funds -->
    <div class="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
      <p class="w-fit font-bold text-base opacity-50">Your withdrawable funds</p>

      {#each Array(1) as _, index (index)}
        <section class="mt-[18px] flex items-center gap-[18px] justify-between">
          <p class="w-[23%] font-bold text-4xl">32.200</p>
          <p class="grow font-bold text-base opacity-50">DEV</p>
          <button
            disabled={true}
            class="hs-button is-filled w-fit py-3.5 px-[22px] ">Withdraw DEV</button>
        </section>
      {/each}
    </div>

    <!-- Total withdrawable funds -->
    <div class="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
      <p class="w-fit font-bold text-base opacity-50">Total withdrawable funds</p>

      {#each Array(1) as _, index (index)}
        <section class="mt-[18px] flex items-center gap-[18px] justify-between">
          <p class="w-[23%] font-bold text-2xl">32.200</p>
          <p class="grow font-bold text-base opacity-50">DEV</p>
        </section>
      {/each}
    </div>

    <!-- Cumulative funds -->
    <div class="mt-8 w-full max-w-full border-[1px] rounded-[18px] p-8 border-[#3A4158] bg-[#3A4158]">
      <p class="w-fit font-bold text-base opacity-50">Cumulative funds</p>

      {#each Array(1) as _, index (index)}
        <section class="mt-[18px] flex items-center gap-[18px] justify-between">
          <p class="w-[23%] font-bold text-2xl">32.200</p>
          <p class="grow font-bold text-base opacity-50">DEV</p>
        </section>
      {/each}
    </div>
  </div>
</div>
