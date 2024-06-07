<script lang="ts">
  import {
    whenDefined,
    type UndefinedOr,
    whenNotError,
  } from '@devprotocol/util-ts'
  import type { Ticket, TicketHistories } from '.'
  import type { Membership } from '@plugins/memberships'
  import { onMount } from 'svelte'
  import { isNFTTicket } from './index'
  import {
    ProseTextInherit,
    decode,
    i18nFactory,
  } from '@devprotocol/clubs-core'
  import { type TicketStatus, ticketStatus } from './utils/status'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import Check from './Check.svelte'
  import { type Signer, JsonRpcProvider } from 'ethers'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import { Modals, closeAllModals, closeModal, openModal } from 'svelte-modals'
  import { fade } from 'svelte/transition'
  import Modal from './Modal.svelte'
  import { Strings } from './i18n'
  import type { BanningRules } from './utils/get-banning-rules'
  import { getMetadata } from './utils/nft'
  import { requestToGetHistory, requestToPostRedeem } from './utils/api'

  export let ticket: Ticket
  export let membership: UndefinedOr<Membership>
  export let erc721Enumerable: UndefinedOr<string>
  export let tokenId: UndefinedOr<number>
  export let rpcUrl: string
  export let ban: BanningRules

  const isInvalidId = ban.id.includes(tokenId ?? 0)

  let benefits: UndefinedOr<TicketStatus[]>
  let signer: UndefinedOr<Signer>
  let idIsLoading: UndefinedOr<string>
  let idIsError: UndefinedOr<{ id: string; error: string }>
  let timeoutToHint: UndefinedOr<NodeJS.Timeout> = undefined
  let isDisplayingHint: boolean = false
  let isWaitingForAPIResult: boolean = false
  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  const mdToHtml = (str?: string) => DOMPurify.sanitize(marked.parse(str ?? ''))
  const provider = new JsonRpcProvider(rpcUrl)

  const nft = membership
    ? Promise.resolve({
        ...membership,
        image: membership.imageSrc,
        attributes: undefined,
      })
    : erc721Enumerable && tokenId
      ? getMetadata(erc721Enumerable, tokenId, provider)
      : undefined

  const onClickABenefit = (benefitId: string) => async () => {
    whenDefined(signer, async (sigr) => {
      const benefit = benefits?.find((item) => item.self.use.id === benefitId)
      openModal(Modal, {
        message: i18n('ModalMessageTicketConfirm', [
          benefit?.availableAtIfenabled?.local().calendar(),
          benefit?.availableUntilIfenabled?.local().calendar(),
          benefit?.expirationIfenabled?.local().calendar(),
        ]),
        onClose: async () => {
          idIsLoading = undefined
          closeAllModals()
        },
        action: async () => {
          /**
           * Define the action after clicking the claiming button.
           */
          idIsLoading = benefitId
          const hash = `Use ${ticket.name}/${benefit?.self.use.name} with #${tokenId} @ts:${new Date().getTime()}`
          timeoutToHint = setTimeout(() => {
            openModal(Modal, {
              spinner: true,
              message: i18n('ModalMessageNotSigned'),
              closeButton: i18n('ModalCloseTicketConfirm'),
              onClose: async () => {
                isDisplayingHint = false
              },
            })
            isDisplayingHint = true
          }, 8000)
          const sig = await sigr.signMessage(hash).catch((err: Error) => {
            console.log({ err })
            return new Error('Wallet threw something')
          })
          clearTimeout(timeoutToHint)
          const opts = whenNotError(sig, (_sig) => ({
            hash,
            sig: _sig,
            id: tokenId,
            benefitId,
          }))
          const res = await whenNotError(opts, (_opts) => {
            isWaitingForAPIResult = true
            return requestToPostRedeem(ticket, _opts)
          })
          const result = await whenNotError(res, async (_res) =>
            _res.ok
              ? fetchTicketStatus(tokenId!!)
              : new Error(((await _res.json()) as { message: string }).message),
          )
          if (result instanceof Error) {
            idIsError = {
              id: benefitId,
              error: result.message,
            }
          } else {
            idIsError = undefined
          }
          idIsLoading = undefined
          isWaitingForAPIResult = false
        },
        actionButton: i18n('ModalActionTicketConfirm'),
        closeButton: i18n('ModalCloseTicketConfirm'),
        closeAllOnFinished: true,
      })
    }) ??
      openModal(Modal, {
        message: i18n('ModalMessageNotConnected'),
        closeButton: i18n('ModalCloseNotConnected'),
      })
  }
  const onClickBackdrop = () => {
    /**
     * Define the action when clicking the modal backdrop.
     */
    if (timeoutToHint !== undefined) {
      clearTimeout(timeoutToHint)
      timeoutToHint = undefined
    }
    if (isDisplayingHint) {
      closeModal()
      isDisplayingHint = false
      return
    }
    idIsLoading = undefined
    closeAllModals()
  }

  const fetchTicketStatus = async (id: string | number) => {
    const res = await requestToGetHistory(ticket, id)
    const text = res.ok ? await res.text() : undefined
    const history: TicketHistories =
      whenDefined(text, (txt) => decode<TicketHistories>(txt)) ?? {}
    benefits = await ticketStatus(history, ticket, {
      tokenId: id,
      erc721Enumerable: isNFTTicket(ticket) ? ticket.erc721Enumerable : false,
      provider,
    })
    console.log(history, benefits)
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
    if (tokenId) {
      fetchTicketStatus(tokenId)
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
    {#if !tokenId || !nft || isInvalidId}
      <p class="text-center font-bold text-dp-white-600">
        {#if !nft}
          Internal error
        {:else if !tokenId}
          No ID specified
        {:else if isInvalidId}
          Invalid ID
        {/if}
      </p>
    {:else}
      <p>#{tokenId}</p>

      <div class="rounded-lg border border-black/20 bg-black/10 p-4">
        {#await nft then _nft}
          {#if _nft instanceof Error}
            <p>Error: {_nft.message}</p>
          {:else}
            <img
              src={_nft.image}
              alt={_nft.name}
              class="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
            />
          {/if}
        {/await}
      </div>

      <h2 class="text-2xl font-bold">{ticket.name}</h2>

      {#await nft then _nft}
        {#if _nft instanceof Error}
          <p>Error: {_nft.message}</p>
        {:else if _nft.attributes}
          <dl
            class="rounded-md p-2 bg-surface-300 grid gap-2 gap-y-4 grid-cols-[auto,1fr]"
          >
            {#each _nft.attributes as attr}
              <dt class="break-all text-accent-200">
                {i18n('AchievementMetadataAttributes', [attr.trait_type])}
              </dt>
              <dd class="font-bold break-all text-right text-surface-ink">
                {attr.display_type && attr.display_type === 'number'
                  ? new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 3,
                    }).format(Number(attr.value) || 0)
                  : attr.value}
              </dd>
            {/each}
          </dl>
        {/if}
      {/await}

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
                idIsLoading === benefit.self.use.id ||
                isWaitingForAPIResult}
              data-is-loading={idIsLoading === benefit.self.use.id ||
                isWaitingForAPIResult}
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
                  >{i18n('SignToUseThisBenefit')}</span
                >
              {/if}
              {#if !idIsError && benefit.available && benefit.self.expiration}
                {#if benefit.self.availableUntil}
                  <span class="text-center font-bold"
                    >{i18n('AvailableUntil', [
                      benefit.self.availableUntil.local().calendar(),
                    ])}</span
                  >
                {/if}
              {/if}
              {#if !idIsError && !benefit.enablable && benefit.dependency?.unused}
                <span class="text-center font-bold"
                  >{i18n('WillBeAvailableWhenXIsUsed', [
                    benefit.dependency.use.name,
                  ])}</span
                >
              {/if}
              {#if !idIsError && benefit.isTempUnavailable}
                <span class="text-center font-bold"
                  >{i18n('WillBeAvailable', [
                    benefit.availableAt?.local().calendar(),
                  ])}</span
                >
              {/if}
              {#if idIsError?.id === benefit.self.use.id}
                <span class="text-center font-bold">{idIsError.error}</span>
              {/if}
              {#if benefit.self.use.description}
                <div
                  class={`w-full rounded-md bg-white/10 p-2 text-black/80 prose-hr:my-5 ${ProseTextInherit}`}
                >
                  {@html mdToHtml(benefit.self.use.description)}
                </div>
              {/if}
              <div
                class="-mb-2 -ml-2 mt-2 justify-self-start text-xs font-bold opacity-50"
              >
                {#if benefit.self.expiration}
                  {i18n('Expiration', [
                    benefit.self.expiration.local().calendar(),
                  ])}
                {:else if benefit.self.usageStartExpiration}
                  {i18n('UsageStart', [
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
    on:click={onClickBackdrop}
  />
</Modals>
