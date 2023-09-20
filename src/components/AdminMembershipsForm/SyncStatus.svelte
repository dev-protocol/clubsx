<script lang="ts">
  import { onMount } from 'svelte'
  import {
    JsonRpcProvider,
    type ContractRunner,
    type Signer,
    type TransactionResponse,
  } from 'ethers'
  import {
    type UndefinedOr,
    whenDefined,
    whenDefinedAll,
    whenNotError,
  } from '@devprotocol/util-ts'
  import { arrayify, clientsSTokens } from '@devprotocol/dev-kit'
  import PQueue from 'p-queue'
  import { values } from 'ramda'
  import type { ExpectedStatus, State } from './types'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { Membership } from '@plugins/memberships'

  type Status = {
    source: Membership
    state: State
    payload: string
    customDescriptor: {
      set: Promise<boolean>
    }
    image: {
      set: Promise<boolean>
    }
  }

  export let propertyAddress: string
  export let rpcUrl: string
  export let customDescriptorAddress: string | undefined
  export let expected: ExpectedStatus[]
  export let stateFetcher: (opts: {
    provider: ContractRunner
    propertyAddress: string
    payload: string
  }) => Promise<Record<string, any>>
  export let stateSetter: (opts: {
    provider: Signer
    propertyAddress: string
    states: typeof expected
  }) => Promise<TransactionResponse>

  const queue = new PQueue({ concurrency: 1 })

  let provider: ContractRunner = new JsonRpcProvider(rpcUrl)
  let signer: UndefinedOr<Signer>
  let syncStatusDescriptor: boolean | Error = false
  let syncStatusImages: boolean | Error = false

  const checkCustomDescriptor = async (
    data: ExpectedStatus,
  ): Promise<boolean> => {
    const [l1, l2] = await clientsSTokens(provider)
    const sTokensManager = l1 ?? l2
    const descriptor = await whenDefined(sTokensManager, (cont) =>
      cont.descriptorOfPropertyByPayload(propertyAddress, data.payload),
    )
    const test =
      descriptor?.toLowerCase() === customDescriptorAddress?.toLowerCase()
    console.log({ test, descriptor, customDescriptorAddress })
    return test
  }

  const checkImage = async (data: ExpectedStatus): Promise<boolean> => {
    const res = await whenDefined(provider, (prov) =>
      stateFetcher({
        provider: prov,
        propertyAddress,
        payload: data.payload,
      }),
    )
    const expectedValues = values(data.state)
    const resultValues = arrayify(res ?? {})
    const test = expectedValues.every((v, i) => resultValues[i] === v)

    console.log('checkImage', test, propertyAddress, data, 'res',resultValues)
    return test
  }

  const sourceStatuses: () => Status[] = () =>
    expected.map(
      ({ payload, source, state }): Status => ({
        source,
        state,
        payload,
        customDescriptor: {
          set: queue.add(() =>
            checkCustomDescriptor({ payload, source, state }),
          ) as Promise<boolean>,
        },
        image: {
          set: queue.add(() =>
            checkImage({ payload, source, state }),
          ) as Promise<boolean>,
        },
      }),
    )
  const outOfSyncDescriptors = async (source: Status[]): Promise<Status[]> => {
    const allData = await Promise.all(
      source.map(async ({ customDescriptor }) => customDescriptor.set),
    )
    const set = new Set<Status | undefined>(
      allData.map((res, i) => (res ? undefined : source[i])),
    )
    set.delete(undefined)
    return Array.from(set as Set<Status>)
  }

  const outOfSyncImages = async (source: Status[]): Promise<Status[]> => {
    const allData = await Promise.all(
      source.map(async ({ image }) => image.set),
    )
    const set = new Set<Status | undefined>(
      allData.map((res, i) => (res ? undefined : source[i])),
    )
    set.delete(undefined)
    return Array.from(set as Set<Status>)
  }

  let statuses: Status[] = sourceStatuses()
  let listOfoutOfSyncDescriptors: Promise<Status[]> =
    outOfSyncDescriptors(statuses)
  let listOfoutOfSyncImages: Promise<Status[]> = outOfSyncImages(statuses)

  const initStatuses = () => {
    statuses = sourceStatuses()
    listOfoutOfSyncDescriptors = outOfSyncDescriptors(statuses)
    listOfoutOfSyncImages = outOfSyncImages(statuses)
  }

  const onClickSyncDescriptor = async () => {
    syncStatusDescriptor = true
    const [l1, l2] = await clientsSTokens(provider)
    const sTokensManager = l1 ?? l2
    const items = await listOfoutOfSyncDescriptors
    const res =
      (await whenDefinedAll(
        [sTokensManager, customDescriptorAddress],
        ([cont, descriptor]) =>
          cont
            .setTokenURIDescriptor(
              propertyAddress,
              descriptor,
              items.map(({ payload }) => payload),
            )
            .catch((err) => new Error(err)),
      )) ?? new Error('Client error: try it again!')
    const result = await whenNotError(res, (res_) =>
      res_.wait().catch((err) => new Error(err)),
    )
    syncStatusDescriptor = result instanceof Error ? result : false
    initStatuses()
  }

  const onClickSyncImages = async () => {
    syncStatusImages = true
    const images = await listOfoutOfSyncImages
    const items: ExpectedStatus[] = images.map((image) => ({
      payload: image.payload,
      state: image.state,
      source: image.source,
    }))
    const res =
      (await whenDefinedAll([items, signer], ([states, signer_]) =>
        stateSetter({ provider: signer_, states, propertyAddress }).catch(
          (err) => new Error(err),
        ),
      )) ?? new Error('Client error: try it again!')
    const result = await whenNotError(res, (res_) =>
      res_.wait().catch((err) => new Error(err)),
    )
    syncStatusImages = result instanceof Error ? result : false
    initStatuses()
  }

  onMount(async () => {
    const { connection } = await import('@devprotocol/clubs-core/connection')

    connection().provider.subscribe((provider_) => {
      whenDefined(provider_, (prov) => (provider = prov))
    })
    connection().signer.subscribe((signer_) => {
      signer = signer_
    })
  })
</script>

<section>
  <h2 class="mb-6 text-2xl">Publish memberships on the blockchain</h2>
  <p class="mb-8">
    Memberships just created are not yet published on the blockchain. Submit all
    transactions to start offering memberships.
  </p>
  <table
    class="w-full max-w-5xl border-separate overflow-x-auto rounded-md border border-dp-blue-grey-200"
  >
    <thead>
      <tr class="grid grid-cols-[2fr,1fr,1fr]">
        <th></th>
        <th
          class="grid grid-flow-row content-start justify-center justify-center justify-items-center gap-2 p-2"
          ><span>Initialization</span>{#await listOfoutOfSyncDescriptors}
            <span class="block h-6">
              <Skeleton />
            </span>
          {:then value}
            <button
              class="hs-button is-outlined is-small"
              disabled={value.length < 1}
              on:click={onClickSyncDescriptor}
              >{value.length > 0 ? 'Send' : 'Completed'}</button
            >
            {#if syncStatusDescriptor === true}
              <div
                role="presentation"
                class="mx-auto h-10 w-10 animate-spin rounded-full border-l border-r border-t border-native-blue-300"
              />
            {/if}
            {#if syncStatusDescriptor instanceof Error}
              <p class="text-dp-red-300" title={syncStatusDescriptor.message}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </p>
            {/if}
          {/await}</th
        >
        <th
          class="grid grid-flow-row content-start justify-center justify-items-center gap-2 p-2"
          ><span>Registration</span>{#await listOfoutOfSyncImages}
            <span class="block h-6">
              <Skeleton />
            </span>
          {:then value}
            <button
              class="hs-button is-outlined is-small"
              disabled={value.length < 1}
              on:click={onClickSyncImages}
              >{value.length > 0 ? 'Send' : 'Completed'}</button
            >
            {#if syncStatusImages === true}
              <div
                role="presentation"
                class="mx-auto h-10 w-10 animate-spin rounded-full border-l border-r border-t border-native-blue-300"
              />
            {/if}
            {#if syncStatusImages instanceof Error}
              <p class="text-dp-red-300" title={syncStatusImages.message}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </p>
            {/if}
          {/await}</th
        >
      </tr>
    </thead>
    <tbody>
      {#each statuses as status}
        <tr
          class="grid grid-cols-[2fr,1fr,1fr] border-b border-dp-blue-grey-200 last:border-0"
        >
          <td class="flex items-center gap-2 p-2"
            ><img
              class="h-10 w-10 rounded object-cover"
              src={status.source.imageSrc}
              alt={status.source.name}
            /><span class="text-sm opacity-50">{status.source.name}</span></td
          >
          <td class="flex items-center justify-center p-2"
            >{#await status.customDescriptor.set}
              <span class="block h-6">
                <Skeleton />
              </span>
            {:then value}{#if value}<svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-4 w-4 opacity-50"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              {:else}<span class="text-sm text-dp-red-300">●</span
                >{/if}{/await}</td
          >
          <td class="flex items-center justify-center p-2"
            >{#await status.image.set}
              <span class="block h-6">
                <Skeleton />
              </span>
            {:then value}{#if value}<svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-4 w-4 opacity-50"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              {:else}<span class="text-sm text-dp-red-300">●</span
                >{/if}{/await}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</section>