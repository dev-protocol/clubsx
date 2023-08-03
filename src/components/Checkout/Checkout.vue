<template>
  <div
    v-if="!stakeSuccessful"
    class="bg-dp-blue-grey-300 relative mx-auto mb-12 grid items-start rounded-xl p-4 shadow lg:container lg:mt-12 lg:grid-cols-[auto,_480px] lg:gap-12"
  >
    <section class="flex flex-col">
      <slot name="before:transaction-form"></slot>

      <h2 class="mb-8 font-title text-4xl font-bold">
        <span v-if="page === 'BUY'">BUY</span>
        <span v-if="page === 'JOIN'">JOIN</span>
      </h2>
      <div
        v-if="verifiedPropsCurrency === currencyOption.DEV || usePolygonWETH"
        class="mb-8"
      >
        <h3 class="mb-4 text-2xl">Approval</h3>
        <button
          @click="approve"
          v-if="approveNeeded || approveNeeded === undefined"
          :disabled="isApproving || approveNeeded === undefined"
          class="flex items-center rounded border bg-gray-600 p-2 px-4"
        >
          <svg
            v-if="isApproving"
            class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Sign with wallet and approve
        </button>
        <button
          v-if="approveNeeded === false"
          disabled
          class="rounded border border-gray-400 bg-gray-600 p-2 px-4 text-gray-400"
        >
          You've already approved
        </button>
      </div>
      <div class="mb-8">
        <h3 class="mb-4 text-2xl">Purchase membership</h3>
        <button
          v-if="approveNeeded"
          disabled
          class="rounded border border-gray-400 bg-gray-600 p-2 px-4 text-gray-400"
        >
          <span>Purchase</span>
        </button>
        <button
          v-if="!approveNeeded"
          @click="submitStake"
          :disabled="isStaking || approveNeeded"
          class="flex items-center rounded border bg-gray-600 p-2 px-4"
        >
          <svg
            v-if="isStaking"
            class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>

          <span>Purchase</span>
        </button>
      </div>
    </section>
    <div
      class="grid grid-cols-1 content-start overflow-hidden rounded border border-white/30"
    >
      <section class="border-b border-white/30 p-4">
        <h3 class="mb-2 text-xl opacity-70">Purchase</h3>
        <p class="flex items-center text-2xl uppercase">
          <Skeleton
            v-if="
              (verifiedPropsCurrency == currencyOption.ETH && !ethAmount) ||
              (verifiedPropsCurrency == currencyOption.DEV && !devAmount)
            "
            class="mr-4 inline-block h-[1.2em] w-24"
          />

          <span v-if="verifiedPropsCurrency == currencyOption.DEV && devAmount"
            >{{ devAmount }} $DEV</span
          >
          <span v-if="verifiedPropsCurrency == currencyOption.ETH && ethAmount"
            >{{ ethAmount }} $ETH</span
          >
        </p>
        <aside
          v-if="verifiedPropsCurrency !== currencyOption.DEV"
          class="ml-4 mt-4 border-l border-white/30 pl-4"
        >
          <h4 class="text-md mb-2 opacity-70">Replace</h4>
          <Skeleton
            v-if="!devAmount"
            class="mr-4 inline-block h-[1.2em] w-32"
          />
          <p v-if="devAmount" class="text-sm uppercase">{{ devAmount }} $DEV</p>
          <div v-if="ethFeeAmount" class="mt-2">
            <h4 class="text-md mb-2 opacity-70">Fee included</h4>
            <p class="text-sm uppercase">{{ ethFeeAmount }} $ETH</p>
          </div>
        </aside>
      </section>
      <section class="p-4">
        <h3 class="mb-2 text-xl opacity-70">Preview</h3>
        <div
          class="mx-auto flex flex-col justify-center gap-4 rounded bg-zinc-900 p-4"
        >
          <div>
            <Skeleton v-if="previewName === undefined" class="min-h-[1.5em]" />
            <span v-if="previewName" class="text-sm">{{ previewName }}</span>
          </div>

          <Skeleton
            v-if="previewImageSrc === undefined"
            class="mx-auto aspect-square h-full w-full"
          />
          <img
            v-if="previewImageSrc"
            :src="previewImageSrc"
            class="h-full w-full"
          />
        </div>
      </section>
    </div>
  </div>
  <section
    style="height: calc(100vh - 74px)"
    class="flex flex-col items-center justify-center"
    v-if="stakeSuccessful"
  >
    <h2 class="mb-8 font-title text-4xl font-bold">Completed</h2>
    <a href="/" class="text-blue-400">Back to top</a>
  </section>
</template>

<script lang="ts">
import {
  positionsCreate,
  positionsCreateWithEth,
} from '@devprotocol/dev-kit/agent'
import { connection as getConnection } from '@devprotocol/clubs-core/connection'
import { UndefinedOr, whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/composition-api'
import {
  BigNumberish,
  ContractRunner,
  JsonRpcProvider,
  MaxUint256,
  formatUnits,
  parseUnits,
} from 'ethers'
import BigNumber from 'bignumber.js'
import { Subscription, zip } from 'rxjs'
import { CurrencyOption } from '@constants/currencyOption'
import { fetchDevForEth, fetchEthForDev, fetchSTokens } from '@fixtures/utility'
import Skeleton from '@components/Global/Skeleton.vue'
import { stakeWithEthForPolygon } from '@fixtures/dev-kit'

type Data = {
  parsedAmount: BigNumberish
  approveNeeded: UndefinedOr<boolean>
  isApproving: boolean
  isStaking: boolean
  subscriptions: Subscription[]
  stakeSuccessful: boolean
  account?: string
  ethAmount: UndefinedOr<string>
  devAmount: UndefinedOr<string>
  ethFeeAmount: UndefinedOr<string>
  chain: UndefinedOr<number>
  previewImageSrc: UndefinedOr<string>
  previewName: UndefinedOr<string>
}

let providerPool: UndefinedOr<ContractRunner>

export default defineComponent({
  props: {
    amount: Number,
    destination: String,
    currency: String, // 'DEV' or 'ETH'
    page: String, // 'JOIN or BUY'
    feeBeneficiary: String,
    feePercentage: Number,
    payload: String,
    rpcUrl: String,
  },
  data() {
    return {
      parsedAmount: this.amount ? parseUnits(this.amount.toString(), 18) : 0,
      approveNeeded: undefined,
      subscriptions: [],
      stakeSuccessful: false,
      account: undefined,
      isApproving: false,
      isStaking: false,
      ethAmount: undefined,
      devAmount: undefined,
      ethFeeAmount: undefined,
      chain: undefined,
      previewImageSrc: undefined,
      previewName: undefined,
    } as Data
  },
  computed: {
    d(): CurrencyOption {
      return this.currency?.toUpperCase() === 'ETH'
        ? CurrencyOption.ETH
        : CurrencyOption.DEV
    },
    usePolygonWETH(): boolean {
      return (
        this.verifiedPropsCurrency === CurrencyOption.ETH &&
        (this.chain === 137 || this.chain === 80001)
      )
    },
    currencyOption() {
      return CurrencyOption
    },
  },
  components: { Skeleton },
  async mounted() {
    const connection = getConnection()

    const sub = zip(
      connection.provider,
      connection.account,
      connection.chain,
    ).subscribe(async ([provider, account, chain]) => {
      providerPool = provider
      this.account = account
      this.chain = chain
      whenDefinedAll(
        [providerPool, account, this.destination, this.amount],
        async ([prov, userAddress, destination, amount]) => {
          ;(this.verifiedPropsCurrency !== CurrencyOption.ETH ||
            this.usePolygonWETH) &&
            this.checkApproved(
              prov,
              userAddress,
              destination,
              amount,
              this.usePolygonWETH,
            )
        },
      )
    })
    this.subscriptions.push(sub)

    const provider = new JsonRpcProvider(this.rpcUrl)
    const chain = Number((await provider.getNetwork()).chainId)

    whenDefinedAll(
      [this.destination, this.amount],
      async ([destination, amount]) => {
        const feeDeposit = this.feePercentage
          ? new BigNumber(this.feePercentage)
          : 0
        const [devAmount, ethAmount] = await Promise.all([
          this.verifiedPropsCurrency === CurrencyOption.DEV
            ? this.amount
            : await fetchDevForEth({
                provider,
                tokenAddress: destination,
                amount: new BigNumber(amount)
                  .times(new BigNumber(1).minus(feeDeposit))
                  .toNumber(),
                chain,
              }).then(formatUnits),
          this.verifiedPropsCurrency === CurrencyOption.ETH
            ? this.amount
            : await fetchEthForDev({
                provider,
                tokenAddress: destination,
                amount: amount,
              }).then(formatUnits),
        ])

        this.devAmount = new BigNumber(devAmount ?? 0)
          .dp(9)
          .toFixed()
          .toString()
        this.ethAmount = new BigNumber(ethAmount ?? 0)
          .dp(9)
          .toFixed()
          .toString()
        this.ethFeeAmount = whenDefined(ethAmount, (_eth) =>
          new BigNumber(_eth).times(feeDeposit).dp(9).toFixed().toString(),
        )
        const sTokens = await fetchSTokens({
          provider,
          tokenAddress: destination,
          amount: devAmount,
          payload: this.payload,
        })
        this.previewImageSrc = sTokens.image
        this.previewName = sTokens.name
      },
    )
  },
  destroyed() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe()
    }
  },
  methods: {
    approve() {
      whenDefinedAll(
        [providerPool, this.account, this.destination, this.parsedAmount],
        async ([prov, account, destination, amount]) => {
          const res = this.usePolygonWETH
            ? await stakeWithEthForPolygon({
                provider: prov,
                propertyAddress: destination,
                ethAmount: amount.toString(),
                from: account,
              }).then((res) => res.create())
            : await positionsCreate({
                provider: prov,
                destination,
                amount: amount.toString(),
                from: account,
              })
          whenDefined(res, async (results) => {
            const { waitOrSkipApproval } = await results.approveIfNeeded({
              amount: MaxUint256.toString(),
            })
            this.isApproving = true
            await waitOrSkipApproval()
            console.log('approve res is: ', res)
            this.isApproving = false
            this.approveNeeded = false
          })
        },
      )
    },
    async checkApproved(
      provider: ContractRunner,
      userAddress: string,
      destination: string,
      amount: BigNumberish,
      isPolygonWETH: boolean,
    ) {
      const res = isPolygonWETH
        ? await stakeWithEthForPolygon({
            provider,
            propertyAddress: destination,
            from: userAddress,
            ethAmount: amount.toString(),
          }).then((res) => res.create())
        : await positionsCreate({
            provider,
            destination,
            from: userAddress,
            amount: amount.toString(),
          })
      this.approveNeeded = whenDefined(res, (x) => x.approvalNeeded)
    },
    async submitStake() {
      debugger
      await whenDefinedAll(
        [
          providerPool,
          this.account,
          this.destination,
          this.amount,
          this.parsedAmount?.toString(),
        ],
        async ([prov, account, destination, amount, parsedAmount]) => {
          if (this.verifiedPropsCurrency === CurrencyOption.ETH) {
            if (this.usePolygonWETH) {
              const res = await stakeWithEthForPolygon({
                provider: prov,
                propertyAddress: destination,
                ethAmount: amount.toString(),
                gatewayAddress: this.feeBeneficiary ?? undefined,
                gatewayBasisPoints:
                  typeof this.feePercentage === 'number'
                    ? this.feePercentage * 10_000
                    : undefined,
                payload: this.payload,
                from: account,
              })
              await whenDefined(res, async (x) => {
                this.isStaking = true
                const create = await x.create()
                const approveIfNeeded = await create?.approveIfNeeded({
                  amount: parsedAmount,
                })
                const waitOrSkipApproval =
                  await approveIfNeeded?.waitOrSkipApproval()
                const run = await waitOrSkipApproval?.run()
                const res = await run?.wait()
                console.log('res is: ', res)
                this.isStaking = false
                this.stakeSuccessful = true
              })
            } else {
              // handle ETH stake
              const res = await positionsCreateWithEth({
                provider: prov,
                destination,
                ethAmount: parsedAmount,
                gatewayAddress: this.feeBeneficiary ?? undefined,
                gatewayBasisPoints:
                  typeof this.feePercentage === 'number'
                    ? this.feePercentage * 10_000
                    : undefined,
                payload: this.payload,
              })
              await whenDefined(res, async (x) => {
                this.isStaking = true
                const create = await x.create()
                const res = await create.wait()
                console.log('res is: ', res)
                this.isStaking = false
                this.stakeSuccessful = true
              })
            }
          } else {
            // handle DEV stake
            const res = await positionsCreate({
              provider: prov,
              from: account,
              destination,
              amount: parsedAmount,
            })

            await whenDefined(res, async (x) => {
              this.isStaking = true
              const approveIfNeeded = await x.approveIfNeeded()
              const waitOrSkipApproval =
                await approveIfNeeded.waitOrSkipApproval()
              const run = await waitOrSkipApproval.run()
              const res = await run.wait()
              console.log('res is: ', res)
              this.isStaking = false
              this.stakeSuccessful = true
            })
          }
        },
      )
    },
  },
})
</script>
