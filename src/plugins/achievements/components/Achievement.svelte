<script lang="ts">
  import { onMount } from 'svelte'
  import { ZeroAddress, type Signer } from 'ethers'

  import { i18nFactory } from '@devprotocol/clubs-core'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  import { meta } from '../index'
  import { Strings } from '../i18n'
  import type { Achievement } from '../types'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import AchievementDefaultIcon from '../assets/achievement.svg'

  export let achievementId: string = ''

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  let achievement: Achievement
  let connection: typeof Connection
  let signer: Signer | undefined
  let currentAddress: string | undefined

  let isFetchingAchievementData = false

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection
    connection().signer.subscribe((s) => {
      signer = s
    })
    connection().account.subscribe((a) => {
      currentAddress = a
    })
  }

  onMount(() => {
    i18n = i18nBase(navigator.languages)
    connectOnMount()
    fetchAchievement()
  })

  const fetchAchievement = async () => {
    if (!achievementId) {
      isFetchingAchievementData = false
      return
    }

    isFetchingAchievementData = true
    const response = await fetch(
      `/api/${meta.id}/achievement/${achievementId}`,
      { method: 'GET' },
    )
      .then(
        (res) => {
          if (res.ok) {
            return res
          }
          throw Error('Error ' + res.status + ': ' + res.statusText)
        },
        (err) => {
          throw new Error(err.message)
        },
      )
      .then(
        (res) => res.json(),
        (err) => {
          throw new Error(err.message)
        },
      )
      .then(
        (res) => res as Achievement,
        (err) => {
          throw new Error(err.message)
        },
      )
      .catch((err) => {
        console.log('Error', err)
        // @TODO: handle error states.
        return undefined
      })

    console.log('Response', response)
    if (response) {
      achievement = response
    }

    isFetchingAchievementData = false
  }
</script>

<section
  class="flex flex-col rounded-2xl p-4 gap-8 items-center shadow bg-dp-white-200 text-dp-white-ink"
>
  <h2 class="text-4xl font-bold">
    {i18n('Achievement')} #{achievementId}
  </h2>

  <div
    class="rounded-[19px] p-4 border-[1px] min-w-[41%] w-[41%] max-w-full border-black/20 bg-black/10"
  >
    {#if isFetchingAchievementData}
      <Skeleton />
    {:else}
      <img
        src={achievement?.metadata?.image || AchievementDefaultIcon.src}
        alt="Achievements UI"
        class="h-auto w-full rounded-[7px] object-cover object-center sm:h-full sm:w-full"
      />
    {/if}
  </div>

  <div class="min-w-[41%] w-[41%] max-w-full">
    <button
      disabled={!currentAddress ||
        currentAddress === ZeroAddress ||
        achievement?.account !== currentAddress}
      class="w-full px-4 py-3 mb-2.5 hs-button is-filled cursor-pointer rounded font-bold text-2xl border-[3px]"
    >
      Claim
    </button>
    <p class={`text-center w-full text-xl font-medium text-black`}>
      {!currentAddress || currentAddress === ZeroAddress
        ? 'Please sign in.'
        : 'Sign to claim the achievement.'}
    </p>
  </div>

  <div class="min-w-[41%] w-[41%] max-w-full text-3xl font-medium">
    {#if isFetchingAchievementData}
      <Skeleton />
    {:else}
      {achievement?.metadata?.name}
    {/if}
  </div>

  <div
    class="min-w-[41%] w-[41%] max-w-full p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal"
  >
    {#if isFetchingAchievementData}
      <Skeleton />
    {:else}
      {achievement?.metadata?.name}
    {/if}
  </div>

  <div class="min-w-[41%] w-[41%] max-w-full text-3xl font-medium">
    Metadata
  </div>

  <section
    class="min-w-[41%] w-[41%] max-w-full p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal flex flex-col items-start gap-4"
  >
    {#if isFetchingAchievementData || !achievement?.metadata?.numberAttributes || !achievement?.metadata?.stringAttributes}
      <Skeleton />
    {:else}
      {#each achievement?.metadata?.numberAttributes as data, i}
        <div class="flex w-full justify-between items-start">
          <p class="text-base font-normal">{data.trait_type}</p>
          <p class="text-base font-bold">{data.value}</p>
        </div>
      {/each}
      {#each achievement?.metadata?.stringAttributes as data, i}
        <div class="flex w-full justify-between items-start">
          <p class="text-base font-normal">{data.trait_type}</p>
          <p class="text-base font-bold">{data.value}</p>
        </div>
      {/each}
    {/if}
  </section>
</section>
