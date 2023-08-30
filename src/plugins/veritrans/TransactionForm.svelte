<script lang="ts">
  import { onMount } from 'svelte'
  import type { Failure, Success } from './api/payment-key'
  import type { ComposedItem } from '.'
  import {
    whenDefined,
    whenDefinedAll,
    whenNotError,
  } from '@devprotocol/util-ts'
  import { JsonRpcProvider, type Contract, type ContractRunner } from 'ethers'
  import { clientsSTokens } from '@devprotocol/dev-kit'
  import { mintedIdByLogs } from '@fixtures/dev-kit'

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

  onMount(async () => {
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
    const [l1, l2] = await clientsSTokens(provider)
    const client = l1 ?? l2
    const sTokens = client?.contract()
    return new Promise<bigint>((res, rej) => {
      const polling = setInterval(async () => {
        const event = await whenDefined(sTokens, (c) =>
          c
            .queryFilter(c.filters.Minted, 'latest')
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
        console.log({ event, id: result })
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
          '/api/devprotocol:clubs:plugin:veritrans/payment-key',
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

<span class="grid gap-16" bind:this={component}>
  <label class="relative flex flex-col">
    {#if account}
      <span class="absolute top-0 ml-8 text-xs opacity-50">Account</span>
    {/if}
    <input
      class="rounded-full bg-gray-500/60 px-8 py-4 text-xl font-bold text-black outline-0 transition-colors placeholder:text-white data-[is-filled=true]:bg-neutral-300"
      placeholder="Please connect a wallet"
      data-is-filled={Boolean(account)}
      value={account}
      disabled
    />
  </label>

  <label class="relative flex flex-col">
    {#if customerEmail}
      <span class="absolute top-0 ml-8 text-xs opacity-50">Email</span>
    {/if}
    <input
      class="rounded-full bg-gray-500/60 px-8 py-4 text-xl font-bold text-black outline-0 transition-colors placeholder:text-white focus:bg-gray-300 disabled:bg-neutral-300 data-[is-filled=true]:bg-neutral-300"
      placeholder="Enter your email"
      data-is-filled={Boolean(customerEmail)}
      type="email"
      bind:value={customerEmail}
      disabled={loading || waitingForMinted}
    />
  </label>

  <label class="relative flex flex-col">
    {#if customerName}
      <span class="absolute top-0 ml-8 text-xs opacity-50">Your name</span>
    {/if}
    <input
      class="rounded-full bg-gray-500/60 px-8 py-4 text-xl font-bold text-black outline-0 transition-colors placeholder:text-white focus:bg-gray-300 disabled:bg-neutral-300 data-[is-filled=true]:bg-neutral-300"
      placeholder="Enter your name"
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
      class="rounded-full bg-black px-8 py-4 text-center text-xl font-bold text-white transition disabled:bg-neutral-300 data-[is-progress=true]:animate-pulse data-[on-error=true]:bg-red-600"
    >
      Pay with a credit card
    </button>

    {#if error}
      <p class="text-bold mt-2 rounded-md bg-red-600 p-2 text-white">{error}</p>
    {/if}
  </span>

  {#if loading || waitingForMinted}
    <span class="grid justify-center gap-6">
      <div
        role="presentation"
        class="mx-auto h-16 w-16 animate-spin rounded-full border-l border-r border-t border-native-blue-300"
      />
      {#if loading}
        <p>Awaiting payment complete...</p>
      {/if}
      {#if waitingForMinted}
        <p>Just a few minutes until your item is minted...</p>
      {/if}
    </span>
  {/if}
</span>
