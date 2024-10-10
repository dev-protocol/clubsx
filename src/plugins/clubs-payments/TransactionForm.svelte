<script lang="ts">
  import { onMount } from 'svelte'
  import type { Failure, Success } from './api/payment-key'
  import type { ComposedItem } from '.'
  import {
    whenDefined,
    whenDefinedAll,
    whenNotError,
  } from '@devprotocol/util-ts'
  import { JsonRpcProvider } from 'ethers'
  import { clientsSTokens } from '@devprotocol/dev-kit'
  import { i18nFactory, mintedIdByLogs } from '@devprotocol/clubs-core'
  import {
    IconBouncingArrowRight,
    IconSpinner,
  } from '@devprotocol/clubs-core/ui/svelte'
  import { Strings } from './i18n'

  export let item: ComposedItem
  export let chainId: number
  export let rpcUrl: string
  let account: string | undefined
  let customerEmail: string | undefined
  let customerName: string | undefined
  let loading = false
  let error: string | undefined
  let component: Element | undefined
  let waitingForMinted = false
  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
    const { connection } = await import('@devprotocol/clubs-core/connection')

    connection().account.subscribe(async (acc) => {
      account = acc
    })
  })

  const onError = (msg: string) => {
    error = msg
    setTimeout(() => {
      error = undefined
    }, 6000)
  }

  const waitForMinted = async () => {
    const provider = new JsonRpcProvider(rpcUrl)
    const blockNumber = await provider.getBlockNumber()
    const [l1, l2] = await clientsSTokens(provider)
    const client = l1 ?? l2
    const sTokens = client?.contract()
    return new Promise<bigint>(async (res, rej) => {
      const polling = setInterval(async () => {
        const event = await whenDefined(sTokens, (c) =>
          c
            .queryFilter(c.filters.Minted, blockNumber)
            .catch((err) => new Error(err)),
        )
        const result = await whenNotError(event, (eve) =>
          whenDefinedAll(
            [eve, client, account],
            ([ev, sTokensManager, receipent]) =>
              mintedIdByLogs(ev, {
                sTokensManager,
                receipent,
                payload: item.payload,
              }).catch((err) => new Error(err)),
          ),
        )
        console.log({ blockNumber, event, id: result })
        if (result instanceof Error) {
          clearInterval(polling)
          return rej(result)
        }
        if (result) {
          clearInterval(polling)
          return res(result)
        }
      }, 1000)
    })
  }

  const clickHandler = async () => {
    const pop = (window as { pop?: any }).pop ?? new Error('Library error')
    const params = whenNotError(
      pop,
      () =>
        whenDefinedAll(
          [item.id, account, customerName, customerEmail],
          ([id_, account_, customerName_, customerEmail_]) => ({
            id: id_,
            account: account_,
            customerName: customerName_,
            customerEmail: customerEmail_,
            dummy: chainId !== 137 && chainId !== 1,
          }),
        ) ?? new Error('Required fields missing'),
    )

    loading = true

    const paymentKeyApi = whenNotError(
      params,
      ({ id, account, customerName, customerEmail, dummy }) => {
        const url = new URL(
          '/api/devprotocol:clubs:plugin:clubs-payments/payment-key',
          location.origin,
        )
        url.searchParams.set('id', id)
        url.searchParams.set('eoa', account)
        url.searchParams.set('email.customer_name', customerName)
        url.searchParams.set('email.customer_email_address', customerEmail)
        url.searchParams.set('dummy', String(dummy))
        return url
      },
    )
    const res = await whenNotError(paymentKeyApi, (api) =>
      fetch(api, {
        headers: { 'Content-Type': 'application/json' },
      }).catch((err: Error) => err),
    )

    const data = await whenNotError(res, async (result) =>
      result.ok
        ? ((await result.json()) as Success | Failure)
        : new Error('Request error has occurred'),
    )

    console.log(data)

    const paymentKey = whenNotError(data, (d) =>
      d.status === 'success' ? d.payment_key : new Error(d.message),
    )

    const pay = await whenNotError(paymentKey, (key) =>
      new Promise<{}>((resolve, reject) => {
        pop.pay(key, {
          skipOrderSummary: true,
          autoReturn: true,
          language: 'en', //'en' | 'ja' | 'zh'
          onSuccess: function (result: any) {
            console.log('success')
            console.log(result)
            waitingForMinted = true
            return resolve(result as {})
          },
          onFailure: function (result: any) {
            console.log('failure')
            console.log(result)
            return reject(new Error(`${result.result_code}: ${result.status}`))
          },
          onIncomplete: function (result: any) {
            console.log('incomplete')
            console.log(result)
            return reject(new Error(`${result.status}`))
          },
        })
      }).catch((err: Error) => err),
    )

    loading = false

    const result = await whenNotError(pay, waitForMinted)

    waitingForMinted = false

    return result instanceof Error
      ? onError(result.message)
      : component?.dispatchEvent(
          new CustomEvent('checkout:completed', {
            detail: { id: result },
            bubbles: true,
          }),
        )
  }
</script>

<span
  class="grid gap-6 animate-[fadeIn_.7s_ease-in-out_forwards]"
  bind:this={component}
>
  <label class="hs-form-field is-filled is-large">
    <span class="hs-form-field__label">{i18n('Email')}</span>
    <input
      class="hs-form-field__input"
      placeholder={i18n('EmailPlaceholder')}
      data-is-filled={Boolean(customerEmail)}
      type="email"
      bind:value={customerEmail}
      disabled={loading || waitingForMinted}
    />
  </label>

  <label class="hs-form-field is-filled is-large">
    <span class="hs-form-field__label">{i18n('FullName')}</span>
    <input
      class="hs-form-field__input"
      placeholder={i18n('FullNamePlaceholder')}
      data-is-filled={Boolean(customerName)}
      type="text"
      bind:value={customerName}
      disabled={loading || waitingForMinted}
    />
  </label>

  <span class="grid">
    <button
      on:click={clickHandler}
      disabled={!account ||
        !customerEmail ||
        !customerName ||
        loading ||
        waitingForMinted ||
        Boolean(error)}
      data-is-progress={loading}
      data-on-error={Boolean(error)}
      class="hs-button relative group is-large is-filled data-[is-progress=true]:animate-pulse data-[on-error=true]:bg-red-600"
    >
      <IconBouncingArrowRight
        justifyLeft={true}
        class="group-disabled:hidden"
      />
      {#if loading}
        <IconSpinner class="absolute left-5 size-5" />
      {/if}
      {i18n('PayWithACreditCard')}
    </button>

    {#if error}
      <p class="text-bold mt-2 rounded-md bg-red-600 p-2 text-white">{error}</p>
    {/if}
  </span>

  {#if waitingForMinted}
    <span class="flex items-center justify-center gap-6">
      <IconSpinner />
      <p>Just a few minutes until your item is minted...</p>
    </span>
  {/if}
</span>

<style>
  @keyframes -global-fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 100;
    }
  }
</style>
