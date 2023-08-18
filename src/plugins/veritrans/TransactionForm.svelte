<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import type { Failure, Success } from './api/payment-key'
  import type { ComposedItem } from '.'

  export let item: ComposedItem
  let account: string | undefined
  let customerEmail: string | undefined
  let customerName: string | undefined
  let loading = false
  let error: string | undefined
  let component: Element | undefined

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

  const clickHandler = async () => {
    const pop = (window as { pop?: any }).pop

    if (!pop) {
      onError('Library error')
      return
    }

    loading = true

    const res = await fetch(
      `/api/devprotocol:clubs:plugin:veritrans/payment-key/?id=${item.id}&eoa=${account}&email.customer_name=${customerName}&email.customer_email_address=${customerEmail}`,
      { headers: { 'Content-Type': 'application/json' } },
    )
    loading = false

    if (!res.ok) {
      onError('Request error has occurred.')
      return
    }

    const data: Success | Failure = await res.json()

    console.log(data)

    const paymentKey = data.status === 'success' ? data.payment_key : undefined

    if (!paymentKey) {
      onError(data.message)
      return
    }

    try {
      pop.pay(paymentKey, {
        skipOrderSummary: true,
        autoReturn: true,
        language: 'en', //'en' | 'ja' | 'zh'
        onSuccess: function (result: any) {
          console.log('success')
          console.log(result)
          component?.dispatchEvent(
            new CustomEvent('checkout:completed', { bubbles: true }),
          )
        },
        onFailure: function (result: any) {
          console.log('failure')
          console.log(result)
          onError(result.result_code)
        },
        onIncomplete: function (result: any) {
          console.log('incomplete')
          console.log(result)
          onError(result.result_code)
        },
      })
    } catch (error) {
      console.error(error)
    }
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
      class="rounded-full bg-gray-500/60 px-8 py-4 text-xl font-bold text-black outline-0 transition-colors placeholder:text-white focus:bg-gray-300 data-[is-filled=true]:bg-neutral-300"
      placeholder="Enter your email"
      data-is-filled={Boolean(customerEmail)}
      type="email"
      bind:value={customerEmail}
    />
  </label>

  <label class="relative flex flex-col">
    {#if customerName}
      <span class="absolute top-0 ml-8 text-xs opacity-50">Your name</span>
    {/if}
    <input
      class="rounded-full bg-gray-500/60 px-8 py-4 text-xl font-bold text-black outline-0 transition-colors placeholder:text-white focus:bg-gray-300 data-[is-filled=true]:bg-neutral-300"
      placeholder="Enter your name"
      data-is-filled={Boolean(customerName)}
      type="text"
      bind:value={customerName}
    />
  </label>

  <span class="grid">
    <button
      on:click={clickHandler}
      disabled={!account ||
        !customerEmail ||
        !customerName ||
        loading ||
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
</span>
