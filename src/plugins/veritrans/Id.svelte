<script lang="ts">
  import { onMount } from 'svelte'
  import type { Failure, Success } from './api/payment-key'
  import type { ComposedItem } from '.'
  import { marked } from 'marked'

  export let item: ComposedItem
  let paymentKey: string | undefined = undefined
  let account: string | undefined
  let htmlDescription = marked.parse(item.source.description ?? '')

  onMount(async () => {
    const { connection } = await import('@devprotocol/clubs-core/connection')

    connection().account.subscribe(async (acc) => {
      account = acc
    })
  })

  const clickHandler = async () => {
    const pop = (window as { pop?: any }).pop
    console.log({ pop })
    if (!pop) {
      return
    }

    const res = await fetch(
      `/api/devprotocol:clubs:plugin:veritrans/payment-key/?id=${item.id}&eoa=${account}&email.customer_name={USER_NAME}&email.customer_email_address={USER_EMAIL_ADDRESS}`,
    )
    const data: Success | Failure = await res.json()

    console.log(data)

    paymentKey = data.status === 'success' ? data.payment_key : undefined

    try {
      pop.pay(paymentKey, {
        skipOrderSummary: true,
        autoReturn: true,
        language: 'en', //'en' | 'ja' | 'zh'
        onSuccess: function (result) {
          console.log('success')
          console.log(result)
        },
        onFailure: function (result) {
          console.log('failure')
          console.log(result)
        },
        onIncomplete: function (result) {
          console.log('incomplete')
          console.log(result)
        },
      })
    } catch (error) {
      console.error(error)
    }
  }
</script>

<div
  class="relative mx-auto mb-12 grid items-start rounded-xl bg-black p-4 shadow lg:container lg:mt-12 lg:grid-cols-2 lg:gap-12"
>
  <section class="flex flex-col gap-8">
    <h2 class="text-4xl font-bold">Buy</h2>
    <div class="grid gap-4">
      <h3 class="mb-4 text-2xl">Wallet</h3>
      {#if account}
        <p
          class="truncate rounded-md border-[3px] border-transparent bg-gray-500/60 p-2 text-xl"
        >
          {account}
        </p>
      {:else}
        <p
          class="animate-pulse rounded-md border-[3px] border-transparent bg-gray-500/60 p-2 text-center text-xl"
        >
          Please connect a wallet
        </p>
      {/if}
    </div>
    <button
      class="my-8 w-full rounded-full border-[3px] border-blue-600 bg-blue-600/40 p-2 px-4 text-2xl transition-colors hover:bg-blue-600 disabled:border-gray-400 disabled:bg-gray-600 disabled:text-gray-400"
      on:click={clickHandler}
      disabled={!account}
    >
      Checkout
    </button>
  </section>
  <section class="flex flex-col gap-6">
    <div class="rounded-lg border border-white/20 bg-white/10 p-4">
      <img
        src={item.source.imageSrc}
        alt={item.source.name}
        class="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
      />
    </div>
    <div>
      <h3 class="text-sm text-white/50">
        <span>{item.source.name}</span>
      </h3>
      <p class="mt-2 text-2xl">
        {`\ ${Number(item.price.yen).toLocaleString()}`}
      </p>
      {#if htmlDescription}
        <aside class="mt-6 text-xl text-white/80">
          {htmlDescription}
        </aside>
      {/if}
    </div>
  </section>
</div>
