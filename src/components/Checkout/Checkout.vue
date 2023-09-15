<script lang="ts" setup>
import { onMounted, onUnmounted, ref, type ComputedRef, computed } from 'vue'
import {
  positionsCreate,
  positionsCreateWithEth,
} from '@devprotocol/dev-kit/agent'
import { connection as getConnection } from '@devprotocol/clubs-core/connection'
import {
  type UndefinedOr,
  whenDefined,
  whenDefinedAll,
  whenNotError,
} from '@devprotocol/util-ts'
import {
  type BigNumberish,
  type ContractRunner,
  JsonRpcProvider,
  MaxUint256,
  formatUnits,
  parseUnits,
} from 'ethers'
import BigNumber from 'bignumber.js'
import { type Subscription, combineLatest } from 'rxjs'
import { CurrencyOption } from '@constants/currencyOption'
import { fetchDevForEth, fetchSTokens } from '@fixtures/utility'
import Skeleton from '@components/Global/Skeleton.vue'
import { stakeWithAnyTokens, mintedIdByLogs } from '@fixtures/dev-kit'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Result from './Result.vue'

let providerPool: UndefinedOr<ContractRunner>
let subscriptions: Subscription[] = []

type Props = {
  amount?: number
  destination?: string
  currency?: 'USDC' | 'ETH' | 'DEV' | 'MATIC' | Lowercase<CurrencyOption>
  feeBeneficiary?: string
  feePercentage?: number
  payload?: Uint8Array | string
  rpcUrl: string
  description?: string
  useDiscretePaymentFlow?: boolean
  useInjectedTransactionForm?: boolean
  fiatCurrency?: string
  itemImageSrc?: string
  itemName?: string
  accessControlUrl?: string
  accessControlDescription?: string
}
const props = defineProps<Props>()

const verifiedPropsCurrency: ComputedRef<CurrencyOption> = computed(() => {
  return props.currency?.toUpperCase() === 'ETH'
    ? CurrencyOption.ETH
    : props.currency?.toUpperCase() === 'USDC'
    ? CurrencyOption.USDC
    : props.currency?.toUpperCase() === 'MATIC'
    ? CurrencyOption.MATIC
    : CurrencyOption.DEV
})
const usePolygonWETH: ComputedRef<boolean> = computed(() => {
  return (
    verifiedPropsCurrency.value === CurrencyOption.ETH &&
    typeof chain.value === 'number' &&
    (chain.value === 137 || chain.value === 80001)
  )
})
const useERC20: ComputedRef<boolean> = computed(() => {
  return (
    verifiedPropsCurrency.value !== CurrencyOption.ETH || usePolygonWETH.value
  )
})
const htmlDescription: ComputedRef<UndefinedOr<string>> = computed(() => {
  return (
    props.description && DOMPurify.sanitize(marked.parse(props.description))
  )
})
const htmlVerificationFlow: ComputedRef<UndefinedOr<string>> = computed(() => {
  return (
    props.accessControlDescription &&
    DOMPurify.sanitize(marked.parse(props.accessControlDescription))
  )
})
const accessControlUrl: ComputedRef<UndefinedOr<URL>> = computed(() => {
  return whenDefinedAll(
    [props.accessControlUrl, account.value],
    ([_accessControl, _account]) => {
      const url = new URL(_accessControl)
      url.searchParams.set('account', _account)
      return url
    },
  )
})

const parsedAmount = ref<UndefinedOr<bigint>>(
  props.amount && !props.useDiscretePaymentFlow
    ? parseUnits(
        props.amount.toString(),
        verifiedPropsCurrency.value === CurrencyOption.ETH ||
          verifiedPropsCurrency.value === CurrencyOption.DEV ||
          verifiedPropsCurrency.value === CurrencyOption.MATIC
          ? 18
          : verifiedPropsCurrency.value === CurrencyOption.USDC
          ? 6
          : (18 as never),
      )
    : undefined,
)
const approveNeeded = ref<UndefinedOr<boolean>>(undefined)
const stakeSuccessful = ref<boolean>(false)
const account = ref<UndefinedOr<string>>(undefined)
const isApproving = ref<boolean>(false)
const isStaking = ref<boolean>(false)
const isWaitingForStaked = ref<boolean>(false)
const feeAmount = ref<UndefinedOr<number>>(undefined)
const chain = ref<UndefinedOr<number>>(undefined)
const previewImageSrc = ref<UndefinedOr<string>>(props.itemImageSrc)
const previewName = ref<UndefinedOr<string>>(props.itemName)
const stakingAmount = ref<UndefinedOr<number>>(undefined)
const isCheckingAccessControl = ref<boolean>(false)
const accessControlError = ref<UndefinedOr<Error>>(undefined)
const accessAllowed = ref<UndefinedOr<boolean>>(undefined)
const mintedId = ref<UndefinedOr<bigint>>(undefined)

const approve = function () {
  whenDefinedAll(
    [
      providerPool,
      account.value,
      props.destination,
      parsedAmount.value,
      chain.value,
    ],
    async ([_prov, _account, _destination, _amount, _chain]) => {
      const res =
        verifiedPropsCurrency.value === CurrencyOption.DEV
          ? await positionsCreate({
              provider: _prov,
              destination: _destination,
              from: _account,
              amount: _amount.toString(),
            })
          : await stakeWithAnyTokens({
              provider: _prov,
              propertyAddress: _destination,
              from: _account,
              tokenAmount: _amount.toString(),
              currency: verifiedPropsCurrency.value,
              chain: _chain,
            }).then((res) => res?.create())

      whenDefined(res, async (_res) => {
        const { waitOrSkipApproval } = await _res.approveIfNeeded({
          amount: MaxUint256.toString(),
        })
        isApproving.value = true
        await waitOrSkipApproval()
        console.log('approve res is: ', res)
        isApproving.value = false
        approveNeeded.value = false
      })
    },
  )
}
const checkApproved = async function (
  provider: ContractRunner,
  userAddress: string,
  destination: string,
  amount: BigNumberish,
  chain: number,
) {
  const res =
    verifiedPropsCurrency.value === CurrencyOption.DEV
      ? await positionsCreate({
          provider,
          destination,
          from: userAddress,
          amount: amount.toString(),
        })
      : await stakeWithAnyTokens({
          provider,
          propertyAddress: destination,
          from: userAddress,
          tokenAmount: amount.toString(),
          currency: verifiedPropsCurrency.value,
          chain,
        }).then((res) => res?.create())
  approveNeeded.value = whenDefined(res, (x) => x.approvalNeeded)
  console.log({ approveNeeded })
}
const submitStake = async function () {
  debugger
  await whenDefinedAll(
    [
      providerPool,
      account.value,
      props.destination,
      props.amount,
      parsedAmount.value?.toString(),
      chain.value,
    ],
    async ([_prov, _account, _destination, _amount, _parsedAmount, _chain]) => {
      const id =
        verifiedPropsCurrency.value === CurrencyOption.ETH &&
        !usePolygonWETH.value
          ? await (async () => {
              // handle ETH stake
              const res = await positionsCreateWithEth({
                provider: _prov,
                destination: _destination,
                ethAmount: _parsedAmount,
                gatewayAddress: props.feeBeneficiary ?? undefined,
                gatewayBasisPoints:
                  typeof props.feePercentage === 'number'
                    ? props.feePercentage * 10_000
                    : undefined,
                payload: props.payload,
              })
              return whenDefined(res, async (_res) => {
                isStaking.value = true
                const create = await _res.create()
                isWaitingForStaked.value = true
                const res = await create.wait()
                const id_ = await mintedIdByLogs(res?.logs)
                console.log('res is: ', res)
                console.log({ id_ })
                return id_
              })
            })()
          : verifiedPropsCurrency.value === CurrencyOption.ETH ||
            verifiedPropsCurrency.value === CurrencyOption.USDC ||
            verifiedPropsCurrency.value === CurrencyOption.MATIC
          ? await (async () => {
              const res = await stakeWithAnyTokens({
                provider: _prov,
                propertyAddress: _destination,
                tokenAmount: _amount.toString(),
                currency: verifiedPropsCurrency.value,
                gatewayAddress: props.feeBeneficiary ?? undefined,
                gatewayBasisPoints:
                  typeof props.feePercentage === 'number'
                    ? props.feePercentage * 10_000
                    : undefined,
                payload: props.payload,
                from: _account,
                chain: _chain,
              })
              return whenDefined(res, async (_res) => {
                isStaking.value = true
                const create = await _res.create()
                const approveIfNeeded = await create?.approveIfNeeded({
                  amount: _parsedAmount,
                })
                const waitOrSkipApproval =
                  await approveIfNeeded?.waitOrSkipApproval()
                const run = await waitOrSkipApproval?.run()
                isWaitingForStaked.value = true
                const res = await run?.wait()
                const id_ = await mintedIdByLogs(res?.logs)
                console.log('res is: ', res)
                console.log({ id_ })
                return id_
              })
            })()
          : await (async () => {
              // handle DEV stake
              const res = await positionsCreate({
                provider: _prov,
                from: _account,
                destination: _destination,
                amount: _parsedAmount,
                payload: props.payload,
              })

              return whenDefined(res, async (_x) => {
                isStaking.value = true
                const approveIfNeeded = await _x.approveIfNeeded()
                const waitOrSkipApproval =
                  await approveIfNeeded.waitOrSkipApproval()
                const run = await waitOrSkipApproval.run()
                isWaitingForStaked.value = true
                const res = await run.wait()
                const id_ = await mintedIdByLogs(res?.logs)
                console.log('res is: ', res)
                console.log({ id_ })
                return id_
              })
            })()
      onCompleted({ detail: { id } })
    },
  )
}
const onCompleted = function (ev?: { detail?: { id?: bigint } }) {
  isStaking.value = false
  isWaitingForStaked.value = false
  stakeSuccessful.value = true
  mintedId.value = ev?.detail?.id
}

onMounted(async () => {
  const sub = combineLatest([
    getConnection().provider,
    getConnection().account,
    getConnection().chain,
  ]).subscribe(async ([_provider, _account, _chain]) => {
    providerPool = _provider
    account.value = _account
    chain.value = _chain
    whenDefinedAll(
      [providerPool, _account, props.destination, props.amount, chain.value],
      async ([_prov, _userAddress, _destination, _amount, _chain]) => {
        useERC20 &&
          !props.useDiscretePaymentFlow &&
          checkApproved(_prov, _userAddress, _destination, _amount, _chain)
      },
    )

    const accessControlRes = await whenDefined(
      accessControlUrl.value,
      async (_accessControl) => {
        isCheckingAccessControl.value = true
        const res = await fetch(_accessControl).catch((err: Error) => err)
        const result = await whenNotError(res, async (r) =>
          r.ok ? r.text() : new Error('Bad request'),
        )
        isCheckingAccessControl.value = false
        return result instanceof Error ? result : Number(result) === 1
      },
    )
    if (accessControlRes instanceof Error) {
      accessControlError.value = accessControlRes
    } else {
      accessAllowed.value = accessControlRes
    }
  })
  subscriptions.push(sub)

  const provider = new JsonRpcProvider(props.rpcUrl)
  const chainId = Number((await provider.getNetwork()).chainId)

  whenDefinedAll(
    [props.destination, props.amount, chainId],
    async ([_destination, _amount, _chain]) => {
      const feeDeposit = props.feePercentage
        ? new BigNumber(props.feePercentage)
        : 0

      const exactFee = new BigNumber(_amount).times(feeDeposit).toFixed()
      feeAmount.value = new BigNumber(exactFee).dp(6).toNumber()

      const [devAmount] = await Promise.all([
        verifiedPropsCurrency.value === CurrencyOption.DEV
          ? props.amount
          : verifiedPropsCurrency.value === CurrencyOption.ETH
          ? fetchDevForEth({
              provider,
              tokenAddress: _destination,
              amount: new BigNumber(_amount)
                .times(new BigNumber(1).minus(feeDeposit))
                .toNumber(),
              chain: chainId,
            }).then(formatUnits)
          : stakeWithAnyTokens({
              provider,
              propertyAddress: _destination,
              tokenAmount: _amount.toString(),
              currency: verifiedPropsCurrency.value,
              chain: _chain,
            }).then((res) => formatUnits(res?.estimatedDev ?? 0)),
      ])

      stakingAmount.value = !props.useDiscretePaymentFlow
        ? new BigNumber(devAmount ?? 0).dp(6).toNumber()
        : undefined

      if (previewImageSrc.value || previewName.value) {
        return
      }

      const sTokens = await fetchSTokens({
        provider,
        tokenAddress: _destination,
        amount: devAmount,
        payload: props.payload,
      }).catch((err) => {
        console.log(err)
        return undefined
      })
      previewImageSrc.value = sTokens?.image
      previewName.value = sTokens?.name
    },
  )
})

onUnmounted(() => {
  for (const sub of subscriptions) {
    sub.unsubscribe()
  }
})
</script>

<template>
  <div
    v-if="!stakeSuccessful"
    class="relative mx-auto mb-12 grid items-start rounded-xl bg-white p-6 text-black shadow lg:container lg:mt-12 lg:grid-cols-2 lg:gap-12"
  >
    <section class="flex flex-col">
      <!-- Transaction form -->
      <div class="grid gap-16 p-5">
        <slot name="before:transaction-form"></slot>

        <div v-if="props.accessControlUrl" class="grid gap-8">
          <!-- Access control section -->
          <h2 class="text-xl">Permission required</h2>
          <span>
            <p class="font-bold text-dp-white-600">Status</p>
            <p
              :data-is-loading="isCheckingAccessControl"
              :data-is-valid="accessAllowed"
              :data-is-error="Boolean(accessControlError)"
              class="hs-button is-large is-fullwidth is-outlined pointer-events-none text-center data-[is-loading=true]:animate-pulse data-[is-valid=false]:border data-[is-error=true]:border-red-600 data-[is-valid=false]:border-neutral-300 data-[is-valid=true]:border-[#43C451] data-[is-valid=false]:bg-white"
            >
              {{
                !account
                  ? `Connect wallet to check you're verified`
                  : isCheckingAccessControl
                  ? `Now checking the verification status`
                  : accessAllowed
                  ? `Verified`
                  : accessControlError
                  ? accessControlError.message
                  : `Unverified`
              }}
            </p>
          </span>

          <div
            v-if="accessAllowed === false && htmlVerificationFlow"
            v-html="htmlVerificationFlow"
            class="md"
          ></div>

          <hr class="bg-[#DFDFDF]" />
        </div>

        <span
          v-if="
            useInjectedTransactionForm &&
            (props.accessControlUrl
              ? props.accessControlUrl && accessAllowed
              : true)
          "
          @checkout:completed="onCompleted"
        >
          <slot name="main:transaction-form"></slot>
        </span>

        <div v-if="!useInjectedTransactionForm" class="grid gap-16">
          <span v-if="useERC20" class="flex flex-col justify-stretch">
            <!-- Approval -->
            <button
              @click="approve"
              :disabled="
                !account ||
                isApproving ||
                approveNeeded === undefined ||
                approveNeeded === false ||
                Boolean(props.accessControlUrl && !accessAllowed)
              "
              :data-is-approving="isApproving"
              class="hs-button is-large is-fullwidth is-filled data-[is-approving=true]:animate-pulse"
            >
              {{
                approveNeeded === false
                  ? "You've already approved"
                  : 'Sign with wallet and approve'
              }}
            </button>
          </span>

          <span class="flex flex-col justify-stretch">
            <!-- Pay -->
            <button
              @click="submitStake"
              :disabled="
                !account ||
                isStaking ||
                approveNeeded !== false ||
                Boolean(props.accessControlUrl && !accessAllowed)
              "
              :data-is-staking="isStaking"
              class="hs-button is-large is-filled data-[is-staking=true]:animate-pulse"
            >
              Pay with {{ verifiedPropsCurrency.toUpperCase() }}
            </button>
          </span>

          <span
            v-if="isApproving || isStaking || isWaitingForStaked"
            class="grid justify-center gap-6"
          >
            <div
              role="presentation"
              class="mx-auto h-16 w-16 animate-spin rounded-full border-l border-r border-t border-native-blue-300"
            />
            <p v-if="isApproving">Waiting for approving to complete...</p>
            <p v-if="isStaking && !isWaitingForStaked">
              Awaiting transaction confirmation on wallet...
            </p>
            <p v-if="isWaitingForStaked">
              Just a few minutes until your item is minted...
            </p>
          </span>
        </div>
      </div>
    </section>
    <section class="flex flex-col gap-6">
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
        <p class="text-2xl font-bold">
          {{
            `${
              Number(amount) > 1 ? Number(amount).toLocaleString() : amount
            } ${(fiatCurrency ?? verifiedPropsCurrency).toUpperCase()}`
          }}
        </p>
        <p v-if="stakingAmount" class="text-sm text-black/90">
          {{
            `${stakingAmount.toLocaleString()} DEV will be staked automatically.`
          }}
        </p>
      </span>
      <aside
        v-if="htmlDescription"
        v-html="htmlDescription"
        class="mt-6 text-xl text-black/80"
      ></aside>
    </section>
  </div>

  <Result :id="mintedId?.toString()" :rpc-url="rpcUrl" v-if="stakeSuccessful">
    <template #before:preview>
      <slot name="result:before:preview" />
    </template>
  </Result>
</template>

<style lang="scss">
.md {
  h1 {
    @apply text-3xl font-bold;
  }
  h2 {
    @apply text-2xl font-bold;
  }
  h3 {
    @apply text-xl;
  }
  h4 {
    @apply font-bold;
  }
  h5 {
    @apply font-bold;
  }
  a {
    @apply inline-block rounded p-1 underline transition hover:bg-white/20;
  }
  ul li {
    @apply list-disc;
  }
  ol li {
    @apply list-decimal;
  }
  pre {
    @apply rounded p-3;
  }
}
</style>
