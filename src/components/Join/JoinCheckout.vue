<template>
  <div
    v-if="!stakeSuccessful"
    class="relative mx-auto grid items-start px-4 lg:container lg:grid-cols-[auto,_480px] lg:gap-12 lg:pt-12"
  >
    <section class="flex flex-col">
      <h2 class="mb-8 font-title text-4xl font-bold">
        <span v-if="page === 'BUY'">BUY</span>
        <span v-if="page === 'JOIN'">JOIN</span>
      </h2>
      <div
        v-if="verifiedCurrency === currencyOption.DEV || usePolygonWETH"
        class="mb-8"
      >
        <h3 class="mb-4 text-2xl">Approval</h3>
        <button
          @click="approve"
          v-if="approveNeeded || approveNeeded === undefined"
          :disabled="isApproving || approveNeeded === undefined"
          class="flex items-center rounded-sm border bg-gray-600 p-2 px-4"
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
          class="rounded-sm border border-gray-400 bg-gray-600 p-2 px-4 text-gray-400"
        >
          You've already approved
        </button>
      </div>
      <div class="mb-8">
        <h3 class="mb-4 text-2xl" v-if="page === 'BUY'">Purchase NFT</h3>
        <h3 class="mb-4 text-2xl" v-if="page === 'JOIN'">Stake</h3>
        <button
          v-if="approveNeeded"
          disabled
          class="rounded-sm border border-gray-400 bg-gray-600 p-2 px-4 text-gray-400"
        >
          <span v-if="page === 'BUY'">Buy</span>
          <span v-if="page === 'JOIN'">Stake</span>
        </button>
        <button
          v-if="!approveNeeded"
          @click="submitStake"
          :disabled="isStaking || approveNeeded"
          class="flex items-center rounded-sm border bg-gray-600 p-2 px-4"
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

          <span v-if="page === 'BUY'">Buy</span>
          <span v-if="page === 'JOIN'">Stake</span>
        </button>
      </div>
    </section>
    <div
      class="grid grid-cols-1 content-start overflow-hidden rounded border border-dp-black-200"
    >
      <section class="border-b border-dp-black-200 p-4">
        <h3 class="mb-2 text-xl opacity-70">Purchase</h3>
        <p class="flex items-center text-2xl uppercase">
          <Skeleton
            v-if="
              (verifiedCurrency == currencyOption.ETH && !ethAmount) ||
              (verifiedCurrency == currencyOption.DEV && !devAmount)
            "
            class="mr-4 inline-block h-[1.2em] w-24"
          />

          <span v-if="verifiedCurrency == currencyOption.DEV && devAmount"
            >{{ devAmount }} $DEV</span
          >
          <span v-if="verifiedCurrency == currencyOption.ETH && ethAmount"
            >{{ ethAmount }} $ETH</span
          >
        </p>
        <aside
          v-if="verifiedCurrency !== currencyOption.DEV"
          class="mt-4 ml-4 border-l border-dp-black-200 pl-4"
        >
          <h4 class="text-md mb-2 opacity-70">Replace</h4>
          <p class="text-sm uppercase">{{ devAmount }} $DEV</p>
        </aside>
      </section>
      <section class="p-4">
        <h3 class="mb-2 text-xl opacity-70">Estimated earnings/year</h3>
        <p class="flex items-center text-2xl uppercase">
          <Skeleton
            v-if="estimatedEarnings === undefined"
            class="mr-4 inline-block h-[1.2em] w-24"
          />
          {{ estimatedEarnings }} $DEV
        </p>
      </section>
    </div>
  </div>
  <section
    style="height: calc(100vh - 74px)"
    class="flex flex-col items-center justify-center"
    v-if="stakeSuccessful"
  >
    <h2 class="mb-8 font-title text-4xl font-bold">Joined</h2>
    <a href="/" class="text-blue-400">Back to top</a>
  </section>
</template>

<script lang="ts">
import {
  positionsCreate,
  positionsCreateWithEth,
  estimationsAPY,
} from '@devprotocol/dev-kit/agent'
import { getConnection } from '@devprotocol/elements'
import { UndefinedOr, whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/composition-api'
import { BigNumberish, constants, providers, utils } from 'ethers'
import BigNumber from 'bignumber.js'
import { parse } from 'query-string'
import { Subscription, zip } from 'rxjs'
import { connectionId } from '@constants/connection'
import { CurrencyOption } from '@constants/currencyOption'
import { fetchDevForEth } from '@fixtures/utility'
import Skeleton from '@components/Global/Skeleton.vue'
import { stakeWithEthForPolygon } from '@fixtures/dev-kit'

type Data = {
  apy: UndefinedOr<number>
  parsedAmount: BigNumberish
  approveNeeded: UndefinedOr<boolean>
  isApproving: boolean
  isStaking: boolean
  subscriptions: Subscription[]
  stakeSuccessful: boolean
  account?: string
  ethAmount: UndefinedOr<string>
  devAmount: UndefinedOr<string>
  chain: UndefinedOr<number>
}

let providerPool: UndefinedOr<providers.BaseProvider>

export default defineComponent({
  props: {
    amount: Number,
    destination: String,
    page: String, // 'JOIN or BUY'
  },
  data() {
    return {
      apy: undefined,
      parsedAmount: this.amount
        ? utils.parseUnits(this.amount.toString(), 18)
        : 0,
      approveNeeded: undefined,
      subscriptions: [],
      stakeSuccessful: false,
      account: undefined,
      isApproving: false,
      isStaking: false,
      ethAmount: undefined,
      devAmount: undefined,
      chain: undefined,
    } as Data
  },
  computed: {
    estimatedEarnings(): number | undefined {
      return this.amount && this.apy
        ? new BigNumber(this.amount * this.apy).dp(9).toNumber()
        : undefined
    },
    verifiedCurrency(): CurrencyOption {
      const query = parse(location.search)
      const input = String(query.input).toLowerCase()
      return input.toUpperCase() === 'ETH'
        ? CurrencyOption.ETH
        : CurrencyOption.DEV
    },
    usePolygonWETH(): boolean {
      return (
        this.verifiedCurrency === CurrencyOption.ETH &&
        (this.chain === 137 || this.chain === 80001)
      )
    },
    currencyOption() {
      return CurrencyOption
    },
  },
  components: { Skeleton },
  async mounted() {
    const connection = getConnection(connectionId)

    if (this.verifiedCurrency === CurrencyOption.ETH) {
      this.approveNeeded = false
    }
    if (connection) {
      const sub = zip(
        connection.provider,
        connection.account,
        connection.chain
      ).subscribe(async ([provider, account, chain]) => {
        providerPool = provider
        this.account = account
        this.chain = chain
        whenDefinedAll(
          [providerPool, account, this.destination, this.amount],
          async ([prov, userAddress, destination, amount]) => {
            ;(this.verifiedCurrency !== CurrencyOption.ETH ||
              this.usePolygonWETH) &&
              this.checkApproved(
                prov,
                userAddress,
                destination,
                amount,
                this.usePolygonWETH
              )
          }
        )
      })
      this.subscriptions.push(sub)
    }
    const provider = new providers.JsonRpcProvider(
      import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    )
    const chain = (await provider.getNetwork()).chainId
    estimationsAPY({ provider: providerPool || provider }).then(([apy]) => {
      this.apy = apy
    })

    whenDefinedAll(
      [this.destination, this.amount],
      async ([destination, amount]) => {
        const devAmount =
          this.verifiedCurrency === CurrencyOption.DEV
            ? this.amount
            : await fetchDevForEth({
                provider,
                tokenAddress: destination,
                amount: amount,
                chain,
              }).then(utils.formatUnits)
        this.devAmount = new BigNumber(devAmount ?? 0)
          .dp(9)
          .toFixed()
          .toString()
      }
    )

    if (this.destination && this.amount) {
      this.ethAmount =
        this.verifiedCurrency === CurrencyOption.ETH
          ? this.amount.toString()
          : ''
    }
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
              amount: constants.MaxUint256.toString(),
            })
            this.isApproving = true
            await waitOrSkipApproval()
            console.log('approve res is: ', res)
            this.isApproving = false
            this.approveNeeded = false
          })
        }
      )
    },
    async checkApproved(
      provider: providers.BaseProvider,
      userAddress: string,
      destination: string,
      amount: BigNumberish,
      isPolygonWETH: boolean
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
      await whenDefinedAll(
        [
          providerPool,
          this.account,
          this.destination,
          this.parsedAmount?.toString(),
        ],
        async ([prov, account, destination, parsedAmount]) => {
          if (this.verifiedCurrency === CurrencyOption.ETH) {
            if (this.usePolygonWETH) {
              const res = await stakeWithEthForPolygon({
                provider: prov,
                propertyAddress: destination,
                ethAmount: parsedAmount,
              })
              whenDefined(res, (x) => {
                this.isStaking = true
                x.create()
                  .then(
                    async (res) =>
                      await res?.approveIfNeeded({ amount: parsedAmount })
                  )
                  .then(async (res) => await res?.waitOrSkipApproval())
                  .then(async (res) => await res?.run())
                  .then((res) => {
                    console.log('res is: ', res)
                    this.isStaking = false
                    this.stakeSuccessful = true
                  })
              })
            } else {
              // handle ETH stake
              const res = await positionsCreateWithEth({
                provider: prov,

                destination,
                ethAmount: parsedAmount,
              })
              whenDefined(res, (x) => {
                this.isStaking = true
                x.create()
                  .then((res) => res.wait())
                  .then((res) => {
                    console.log('res is: ', res)
                    this.isStaking = false
                    this.stakeSuccessful = true
                  })
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

            whenDefined(res, (x) => {
              this.isStaking = true
              x.approveIfNeeded()
                .then((res) => res.waitOrSkipApproval())
                .then((res) => res.run())
                .then((res) => res.wait())
                .then((res) => {
                  console.log('res is: ', res)
                  this.isStaking = false
                  this.stakeSuccessful = true
                })
            })
          }
        }
      )
    },
  },
})
</script>
