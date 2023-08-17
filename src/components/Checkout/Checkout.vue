<template>
  <div
    v-if="!stakeSuccessful"
    class="relative mx-auto mb-12 grid items-start rounded-xl bg-white text-black p-6 shadow lg:container lg:mt-12 lg:grid-cols-2 lg:gap-12"
  >
    <section class="flex flex-col">
      <slot name="before:transaction-form"></slot>

      <!-- Transaction form -->
      <div class="p-5 grid gap-16">
        <span v-if="!account" class="rounded-full bg-neutral-300 text-white px-8 py-4 font-bold text-center">Please connect a wallet</span>

        <span v-if="useERC20" class="flex flex-col justify-stretch">
          <!-- Approval -->
          <button v-if="!account" class="rounded-full bg-neutral-300 text-white px-8 py-4 font-bold text-center" disabled>Approve</button>
          <button
          @click="approve"
          v-if="account && (approveNeeded || approveNeeded === undefined)"
          :disabled="isApproving || approveNeeded === undefined"
          class="rounded-full bg-black text-white px-8 py-4 font-bold text-center disabled:bg-neutral-300"
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
          <button v-if="account && approveNeeded === false" class="rounded-full bg-neutral-300 text-white px-8 py-4 font-bold text-center" disabled>You've already approved</button>
        </span>

        <span class="flex flex-col justify-stretch">
          <!-- Pay -->
          <button v-if="approveNeeded" class="rounded-full bg-neutral-300 text-white px-8 py-4 font-bold text-center" disabled>Pay with {{verifiedPropsCurrency.toUpperCase()}}</button>
          <button
            v-if="!approveNeeded"
            @click="submitStake"
            :disabled="isStaking || approveNeeded"
            :data-is-staking="isStaking"
            class="rounded-full bg-black text-white px-8 py-4 font-bold text-center disabled:bg-neutral-300 data-[is-staking=true]:animate-pulse"
          >
            Pay with {{verifiedPropsCurrency.toUpperCase()}}
          </button>
      </span>

      </div>
    </section>
    <section
      class="flex flex-col gap-6"
    >
      <div class="rounded-lg border border-black/20 bg-black/10 p-4">
        <img
          v-if="previewImageSrc"
          :src="previewImageSrc"
          class="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
        />
        <Skeleton
          v-if="previewImageSrc === undefined"
          class="mx-auto aspect-square h-full w-full"
        />
      </div>
      <span>
        <h3 class="text-sm text-black/50">
          <span>{{ previewName }}</span>
        </h3>
        <p class="text-2xl">
          {{`${Number(amount) > 1 ? Number(amount).toLocaleString() : amount} ${verifiedPropsCurrency.toUpperCase()}`}}
        </p>
      </span>
      <p v-if="feeAmount" class="text-sm">
        {{`${feeAmount.toLocaleString()} ${verifiedPropsCurrency.toUpperCase()} will be staked automatically.`}}
      </p>
      <aside v-if="htmlDescription" v-html="htmlDescription" class="mt-6 text-xl text-black/80"></aside>
    </section>
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
  keccak256,
  parseUnits,
} from 'ethers'
import BigNumber from 'bignumber.js'
import { Subscription, combineLatest, zip } from 'rxjs'
import { CurrencyOption } from '@constants/currencyOption'
import { fetchDevForEth, fetchEthForDev, fetchSTokens } from '@fixtures/utility'
import Skeleton from '@components/Global/Skeleton.vue'
import { stakeWithEthForPolygon } from '@fixtures/dev-kit'
import { marked } from 'marked'

type Data = {
  parsedAmount: BigNumberish
  approveNeeded: UndefinedOr<boolean>
  isApproving: boolean
  isStaking: boolean
  subscriptions: Subscription[]
  stakeSuccessful: boolean
  account?: string
  feeAmount: UndefinedOr<number>
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
    payload: Uint8Array,
    rpcUrl: String,
    description: String
  },
  data() {
    return {
      parsedAmount: this.amount ? parseUnits(
        this.amount.toString(),
        this.verifiedPropsCurrency === CurrencyOption.ETH || this.verifiedPropsCurrency === CurrencyOption.DEV ? 18 : 18
      ) : 0,
      approveNeeded: undefined,
      subscriptions: [],
      stakeSuccessful: false,
      account: undefined,
      isApproving: false,
      isStaking: false,
      feeAmount: undefined,
      chain: undefined,
      previewImageSrc: undefined,
      previewName: undefined,
    } as Data
  },
  computed: {
    verifiedPropsCurrency(): CurrencyOption {
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
    useERC20(): boolean {
      return (
        this.verifiedPropsCurrency !== CurrencyOption.ETH ||
        this.usePolygonWETH
      )
    },
    currencyOption() {
      return CurrencyOption
    },
    htmlDescription() {
      return this.description && marked.parse(this.description ?? '')
    },
  },
  components: { Skeleton },
  async mounted() {
    const sub = combineLatest(
      [getConnection().provider,
      getConnection().account,
      getConnection().chain]
    ).subscribe(async ([provider, account, chain]) => {
      providerPool = provider
      this.account = account
      this.chain = chain
      whenDefinedAll(
        [providerPool, account, this.destination, this.amount],
        async ([prov, userAddress, destination, amount]) => {
          ;(this.useERC20) &&
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
        const [devAmount] = await Promise.all([
          this.verifiedPropsCurrency === CurrencyOption.DEV
            ? this.amount
            : await fetchDevForEth({
                provider,
                tokenAddress: destination,
                amount: new BigNumber(amount)
                  .times(new BigNumber(1).minus(feeDeposit))
                  .toNumber(),
                chain,
              }).then(formatUnits)
        ])

        const sTokens = await fetchSTokens({
          provider,
          tokenAddress: destination,
          amount: devAmount,
          payload: this.payload,
        }).catch(err => {
          console.log(err)
          return undefined
        })
        this.previewImageSrc = sTokens?.image
        this.previewName = sTokens?.name
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
      console.log('this.approveNeeded', this.approveNeeded)
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
                payload: this.payload && keccak256(this.payload),
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
                payload: this.payload && keccak256(this.payload),
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
