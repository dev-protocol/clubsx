<script lang="ts">
  import { onMount } from 'svelte'
  import { type Signer, ethers, formatUnits, Contract, getBigInt } from 'ethers'

  import { tokenInfo } from '@constants/common'
  import { address, defaultAddress, swapAndStakeAddressAbi } from './utils/swapAndStake'

  export let chainId: number
  export let currency: string
  export let signer: Signer | undefined
  export let allBeneficiaries: string[] = []
  export let isYourWithdrawable: boolean = false

  let withdrawable: string = ''
  let isClaming: boolean = false
  let isFetchingData: boolean = false
  let swapAndStakecontract: Contract | undefined = undefined

  onMount(async () => {
    await setContract()
    await fetchWithdrawable()
  })

  const setContract = async () => {
    if (!chainId || !signer) {
      return
    }

    const swapAndStakeAddress =
      address.find((a) => a.chainId === chainId)?.address ||
      defaultAddress.address

    swapAndStakecontract = new ethers.Contract(
      swapAndStakeAddress,
      swapAndStakeAddressAbi,
      signer,
    )
  }

  const fetchWithdrawable = async () => {
    if (!chainId || !swapAndStakecontract || !signer) {
      return
    }

    isFetchingData = true
    const tokenAddress = tokenInfo[currency][chainId].address

    if (isYourWithdrawable) {
      const currentAddress = await signer.getAddress()
      const fee: bigint = BigInt(await swapAndStakecontract.gatewayFees(currentAddress, tokenAddress))
      withdrawable = formatUnits(fee, tokenInfo[currency][chainId].decimals)
    } else {
      let totalWithdrawable: bigint = BigInt('0')
      for (const beneficiary of allBeneficiaries) {
        const fee: bigint = BigInt(await swapAndStakecontract.gatewayFees(beneficiary, tokenAddress))
        totalWithdrawable = totalWithdrawable + fee
      }
      withdrawable = formatUnits(totalWithdrawable, tokenInfo[currency][chainId].decimals)
    }

    isFetchingData = false
  }

  const claimWithdrawable = async (tokenSymbol: string) => {
    if (!chainId || !signer || !swapAndStakecontract || !isYourWithdrawable) {
      return
    }

    isClaming = true
    const tokenAddress = tokenInfo[tokenSymbol][chainId].address
    const txReceipt = await swapAndStakecontract.claim(tokenAddress)
    await txReceipt.wait(1) // TODO: detect success failure
    isClaming = false
  }
</script>

<section class="mt-[18px] flex items-center gap-[18px] justify-between">
  <p class="w-[23%] font-bold text-base">{
    new Intl.NumberFormat(undefined,{ minimumFractionDigits: 2, maximumFractionDigits: 3 })
      .format(Number(withdrawable) || 0)
  } { currency }</p>
  <p class="grow font-bold text-base opacity-50">≈ $32.000</p>
  <button
    on:click|preventDefault={() => claimWithdrawable(currency)}
    disabled={!Number(withdrawable)}
    class={`hs-button is-filled w-[27%] py-3.5 px-[22px] ${isYourWithdrawable ? '' : 'invisible'}`}
  >
    Withdraw {currency}
  </button>
</section>
