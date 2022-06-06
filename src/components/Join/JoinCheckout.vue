<template>
  <div
    v-if="!stakeSuccessful"
    class="relative mx-auto grid px-4 lg:container lg:grid-cols-[auto,_480px] lg:gap-12 lg:pt-12"
  >
    <section class="flex flex-col">
      <h2 class="mb-8 font-title text-4xl font-bold">Join</h2>
      <div v-if="currency === 'dev'" class="mb-8">
        <h3 class="mb-4 text-2xl">Approval</h3>
        <button
          @click="approve"
          v-if="approveNeeded"
          class="rounded-sm border bg-gray-600 p-2 px-4"
        >
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
        <h3 class="mb-4 text-2xl">Stake</h3>
        <button
          v-if="approveNeeded"
          disabled
          class="rounded-sm border border-gray-400 bg-gray-600 p-2 px-4 text-gray-400"
        >
          Stake
        </button>
        <button
          v-if="approveNeeded === false"
          @click="submitStake"
          class="rounded-sm border bg-gray-600 p-2 px-4"
        >
          Stake
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
            v-if="omittedAmountForInputCurrency === undefined"
            class="mr-4 inline-block h-[1.2em] w-24"
          />
          {{ omittedAmountForInputCurrency }} ${{ currency }}
        </p>
        <aside
          v-if="currency !== 'dev'"
          class="mt-4 ml-4 border-l border-dp-black-200 pl-4"
        >
          <h4 class="text-md mb-2 opacity-70">Replace</h4>
          <p class="text-sm uppercase">{{ amount }} $DEV</p>
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
  clientsDev,
  positionsCreate,
  positionsCreateWithEth,
  estimationsAPY,
  clientsLockup,
} from '@devprotocol/dev-kit/agent'
import { getConnection } from '@devprotocol/elements'
import { UndefinedOr, whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/composition-api'
import { BigNumber as BN, BigNumberish, providers, utils } from 'ethers'
import BigNumber from 'bignumber.js'
import { parse } from 'query-string'
import { Subscription, zip } from 'rxjs'
import { connectionId } from 'src/constants/connection'
import { CurrencyOption } from 'src/constants/currencyOption'
import { stake } from 'src/fixtures/dev-kit'
import { fetchEthForDev } from 'src/fixtures/utility'
import Skeleton from '@components/Global/Skeleton.vue'

type Data = {
  currency: CurrencyOption
  amountForInputCurrency: UndefinedOr<string>
  apy: UndefinedOr<number>
  parsedAmount: BigNumberish
  approveNeeded: UndefinedOr<boolean>
  subscriptions: Subscription[]
  stakeSuccessful: boolean
  account?: string
}

let providerPool: UndefinedOr<providers.Provider>

export default defineComponent({
  props: {
    amount: Number,
    destination: String,
  },
  data() {
    return {
      currency: CurrencyOption.DEV,
      amountForInputCurrency: undefined,
      apy: undefined,
      parsedAmount: utils.parseUnits(this.amount.toString(), 18),
      approveNeeded: undefined,
      subscriptions: [],
      stakeSuccessful: false,
      account: undefined,
    } as Data
  },
  computed: {
    omittedAmountForInputCurrency(): string | undefined {
      return this.amountForInputCurrency
        ? new BigNumber(this.amountForInputCurrency).dp(9).toFixed()
        : undefined
    },
    estimatedEarnings(): number | undefined {
      return this.amount && this.apy
        ? new BigNumber(this.amount * this.apy).dp(9).toNumber()
        : undefined
    },
  },
  components: { Skeleton },
  async mounted() {
    const query = parse(location.search)
    const input = String(query.input).toLowerCase()
    this.currency = input === 'eth' ? CurrencyOption.ETH : CurrencyOption.DEV
    const connection = getConnection(connectionId)

    if (this.currency === CurrencyOption.ETH) {
      this.approveNeeded = false
      console.log(this.approveNeeded)
    }
    if (connection) {
      const sub = zip(connection.provider, connection.account).subscribe(
        async ([provider, account]) => {
          providerPool = provider
          this.account = account
          await whenDefinedAll(
            [provider, account],
            async ([prov, userAddress]) => {
              this.checkApproved(prov, userAddress)
            }
          )
        }
      )
      this.subscriptions.push(sub)
    }
    const provider = new providers.JsonRpcProvider(
      import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    )
    estimationsAPY({ provider: providerPool || provider }).then(([apy]) => {
      this.apy = apy
    })

    if (this.destination && this.amount) {
      const amount =
        this.currency === 'eth'
          ? await fetchEthForDev({
              provider: (providerPool || provider) as providers.BaseProvider,
              tokenAddress: this.destination,
              amount: this.amount,
            }).then(utils.formatUnits)
          : this.amount
      this.amountForInputCurrency = amount?.toString()
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
        [providerPool, this.account, this.destination, this.amount],
        async ([prov, account, destination, amount]) => {
          const res = await stake(
            prov as providers.BaseProvider,
            destination,
            account,
            amount
          )

          if (res) {
            const { waitOrSkip } = await res.approveIfNeeded()
            await waitOrSkip()
            console.log('approve res is: ', res)
            this.approveNeeded = false
          }
        }
      )
    },
    async checkApproved(provider: providers.Provider, userAddress: string) {
      const [l1, l2] = await clientsDev(provider)
      const [l1L, l2L] = await clientsLockup(provider)
      const allowance = BN.from(
        (await whenDefinedAll([l1 || l2, l1L || l2L], ([dev, lockup]) =>
          dev.allowance(userAddress, lockup.contract().address)
        )) ?? 0
      )
      this.approveNeeded = allowance?.lt(this.parsedAmount ?? 0) ?? true
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
          if (this.currency === CurrencyOption.ETH) {
            // handle ETH stake
            const res = await positionsCreateWithEth({
              provider: prov,

              destination,
              devAmount: parsedAmount,
            })

            if (res) {
              res
                .create()
                .then((res) => res.wait())
                .then((res) => {
                  console.log('res is: ', res)
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

            if (res) {
              res
                .approveIfNeeded()
                .then((res) => res.waitOrSkip())
                .then((res) => {
                  console.log('res is: ', res)
                  this.stakeSuccessful = true
                })
            }
          }
        }
      )
    },
  },
})
</script>
