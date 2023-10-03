<script lang="ts">
  import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
  import type { Ticket, TicketHistories } from '.'
  import type { Membership } from '@plugins/memberships'
  import { onMount } from 'svelte'
  import { meta } from './index'
  import { decode, i18nFactory } from '@devprotocol/clubs-core'
  import { type TicketStatus, ticketStatus } from './utils/status'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import Check from './Check.svelte'
  import { type Signer, hashMessage, JsonRpcProvider } from 'ethers'
  import { bytes32Hex } from '@fixtures/data/hexlify'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import { Modals, closeModal, openModal } from 'svelte-modals'
  import { fade } from 'svelte/transition'
  import Modal from './Modal.svelte'
  import { Parts, Strings } from './i18n'
  import { expirationDatetime } from './utils/date'

  export let ticket: Ticket
  export let membership: UndefinedOr<Membership>
  export let sTokensId: UndefinedOr<number>
  export let rpcUrl: string

  let benefits: UndefinedOr<TicketStatus[]>
  let signer: UndefinedOr<Signer>
  let idIsLoading: UndefinedOr<string>
  let idIsError: UndefinedOr<{ id: string; error: string }>
  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  const mdToHtml = (str?: string) => DOMPurify.sanitize(marked.parse(str ?? ''))
  const provider = new JsonRpcProvider(rpcUrl)

  const onClickABenefit = (benefitId: string) => async () => {
    whenDefined(signer, async (sigr) => {
      const benefit = benefits?.find((item) => item.self.use.id === benefitId)
      openModal(Modal, {
        message: i18n(Parts.ModalMessageTicketConfirm, [
          benefit?.availableAtIfenabled?.local().calendar(),
          benefit?.availableUntilIfenabled?.local().calendar(),
          benefit?.expirationIfenabled?.local().calendar(),
        ]),
        action: async () => {
          idIsLoading = benefitId
          const hash = hashMessage('')
          const sig = await sigr.signMessage(hash).catch((err) => err)
          const opts = { hash, sig, id: sTokensId, benefitId }
          const res = await fetch(
            `/api/${meta.id}/redeem/${bytes32Hex(ticket.payload)}`,
            {
              method: 'POST',
              body: JSON.stringify(opts),
            },
          )
          if (res.ok) {
            await fetchTicketStatus(sTokensId!!)
          } else {
            idIsError = {
              id: benefitId,
              error: ((await res.json()) as { message: string }).message,
            }
          }
          idIsLoading = undefined
        },
        actionButton: i18n(Parts.ModalActionTicketConfirm),
        closeButton: i18n(Parts.ModalCloseTicketConfirm),
      })
    }) ??
      openModal(Modal, {
        message: i18n(Parts.ModalMessageNotConnected),
        closeButton: i18n(Parts.ModalCloseNotConnected),
      })
  }

  const fetchTicketStatus = async (id: string | number) => {
    const res = await fetch(
      `/api/${meta.id}/history/${bytes32Hex(ticket.payload)}?id=${id}`,
    )
    const text = res.ok ? await res.text() : undefined
    const history: TicketHistories =
      whenDefined(text, (txt) => decode<TicketHistories>(txt)) ?? {}
    benefits = await ticketStatus(history, ticket, { tokenId: id, provider })
    console.log(history, benefits)
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
    if (sTokensId) {
      fetchTicketStatus(sTokensId)
    }
  })

  onMount(async () => {
    const { connection } = await import('@devprotocol/clubs-core/connection')
    connection().signer.subscribe((_signer) => {
      signer = _signer
    })
  })
</script>

<section class="rounded-md bg-white p-6 text-black shadow">
  <div class="mx-auto grid max-w-lg gap-8">
    {#if !sTokensId || !membership}
      <p>Error</p>
    {:else}
      <p>#{sTokensId}</p>

      <div class="rounded-lg border border-black/20 bg-black/10 p-4">
        <img
          src={membership.imageSrc}
          alt={membership.name}
          class="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
        />
      </div>

      <h2 class="text-2xl font-bold">{ticket.name}</h2>

      {#if benefits === undefined}
        <span class="h-40">
          <Skeleton />
        </span>
        <span class="h-32">
          <Skeleton />
        </span>
        <span class="h-16 w-1/2">
          <Skeleton />
        </span>
      {:else}
        {#each benefits as benefit}
          <div>
            <button
              data-is-enablable={benefit.enablable}
              data-is-available={benefit.available}
              data-is-temp-unavailable={benefit.isTempUnavailable}
              data-is-expired={!benefit.enablable && benefit.self.expired}
              data-is-waiting={!benefit.enablable && benefit.dependency?.unused}
              disabled={(!benefit.enablable && benefit.self.expired) ||
                !benefit.enablable ||
                benefit.isTempUnavailable ||
                idIsLoading === benefit.self.use.id}
              data-is-loading={idIsLoading === benefit.self.use.id}
              data-is-error={idIsError?.id === benefit.self.use.id}
              class="group flex grid w-full items-center justify-stretch gap-2 rounded-md border border-[3px] border-transparent px-6 py-4 text-left text-white shadow-xl data-[is-loading=true]:animate-pulse data-[is-waiting=true]:border-native-blue-400 data-[is-waiting=true]:border-native-blue-400 data-[is-available=true]:bg-dp-green-300 data-[is-enablable=true]:bg-native-blue-400 data-[is-error=true]:bg-red-500 data-[is-expired=true]:bg-dp-white-600 data-[is-temp-unavailable=true]:bg-dp-black-200 data-[is-error=true]:text-white data-[is-waiting=true]:text-native-blue-400"
              on:click={onClickABenefit(benefit.self.use.id)}
              ><p class="flex w-full items-center gap-2 justify-self-center">
                <span
                  class="aspect-square h-full rounded-full border border-[3px] border-transparent text-dp-white-600 group-data-[is-waiting=true]:border-native-blue-400 group-data-[is-available=true]:bg-dp-green-200 group-data-[is-enablable=true]:bg-white group-data-[is-expired=true]:bg-white group-data-[is-temp-unavailable=true]:bg-dp-white-200 group-data-[is-waiting=true]:bg-transparent group-data-[is-available=true]:text-white"
                  ><Check />
                </span><span class="flex-grow text-xl font-bold"
                  >{benefit.self.use.name}</span
                >
              </p>
              {#if !idIsError && benefit.enablable}
                <span class="text-center font-bold"
                  >{i18n(Parts.SignToUseThisBenefit)}</span
                >
              {/if}
              {#if !idIsError && benefit.available && benefit.self.expiration}
                {#if benefit.self.availableUntil}
                  <span class="text-center font-bold"
                    >{i18n(Parts.AvailableUntil, [
                      benefit.self.availableUntil.local().calendar(),
                    ])}</span
                  >
                {/if}
              {/if}
              {#if !idIsError && !benefit.enablable && benefit.dependency?.unused}
                <span class="text-center font-bold"
                  >{i18n(Parts.WillBeAvailableWhenXIsUsed, [
                    benefit.dependency.use.name,
                  ])}</span
                >
              {/if}
              {#if !idIsError && benefit.isTempUnavailable}
                <span class="text-center font-bold"
                  >{i18n(Parts.WillBeAvailable, [
                    benefit.availableAt?.local().calendar(),
                  ])}</span
                >
              {/if}
              {#if idIsError?.id === benefit.self.use.id}
                <span class="text-center font-bold">{idIsError.error}</span>
              {/if}
              {#if benefit.self.use.description}
                <div
                  class="md grid w-full gap-2 rounded-md bg-white/10 p-2 text-black/80"
                >
                  {@html mdToHtml(benefit.self.use.description)}
                </div>
              {/if}
              <div
                class="-mb-2 -ml-2 mt-2 justify-self-start text-xs font-bold opacity-50"
              >
                {#if benefit.self.expiration}
                  {i18n(Parts.Expiration, [
                    benefit.self.expiration.local().calendar(),
                  ])}
                {:else if benefit.self.usageStartExpiration}
                  {i18n(Parts.UsageStart, [
                    benefit.self.usageStartExpiration.local().calendar(),
                  ])}
                {/if}
              </div>
            </button>
          </div>
        {/each}
      {/if}
    {/if}
  </div>
</section>

<Modals>
  <div
    slot="backdrop"
    class="fixed inset-0 bg-black/50"
    transition:fade={{ duration: 100 }}
    on:click={closeModal}
  />
</Modals>

<style lang="scss">
  .md {
    color: inherit;
    :global(h1) {
      @apply text-xl font-bold;
    }
    :global(h2) {
      @apply text-lg font-bold;
    }
    :global(h3) {
      @apply text-base;
    }
    :global(h4) {
      @apply text-sm font-bold;
    }
    :global(h5) {
      @apply text-xs font-bold;
    }
    :global(p) {
      @apply text-xs;
    }
    :global(a) {
      @apply inline-block rounded p-1 underline transition hover:bg-white/20;
    }
    :global(ul) {
      @apply list-none;
      :global(li::before) {
        content: '\2022';
        @apply mr-2 text-zinc-300;
      }
    }
    :global(pre) {
      @apply rounded p-3;
    }
  }
</style>
