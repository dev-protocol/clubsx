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

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let achievementId: string = ''

  let achievement: Achievement
  let signer: Signer | undefined
  let connection: typeof Connection
  let currentAddress: string | undefined

  let isClaimingAchievement = false
  let isFetchingAchievementData = false
  let isAchievementDataNotFetched = false
  let claimBtnFeedbackTxt = i18n('SignInMsg')

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection

    connection().signer.subscribe((s) => {
      if (!s) {
        claimBtnFeedbackTxt = i18n('SignInMsg')
      } else {
        claimBtnFeedbackTxt = 'Sign to claim the achievement.'
      }
      signer = s
    })

    connection().account.subscribe((a) => {
      if (!a || a === ZeroAddress) {
        claimBtnFeedbackTxt = i18n('SignInMsg')
      } else {
        claimBtnFeedbackTxt = 'Sign to claim the achievement.'
      }
      currentAddress = a
    })
  }

  const fetchAchievement = async () => {
    if (!achievementId) {
      isFetchingAchievementData = false
      isAchievementDataNotFetched = true
      return
    }

    isFetchingAchievementData = true
    isAchievementDataNotFetched = false

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
        isAchievementDataNotFetched = true
        return undefined
      })

    if (response) {
      if (
        currentAddress &&
        currentAddress != ZeroAddress &&
        response.account !== currentAddress
      ) {
        claimBtnFeedbackTxt = `Looks like you can't claim this.`
      }

      if (response.claimed && response.account === currentAddress) {
        claimBtnFeedbackTxt = 'This achievement is already claimed.'
      }

      achievement = response
      isAchievementDataNotFetched = false
    }

    isFetchingAchievementData = false
  }

  const claimAchievement = async () => {
    if (!achievementId) {
      isClaimingAchievement = false
      claimBtnFeedbackTxt = 'Achievement not found.'
      return
    }
    if (!signer || !currentAddress || currentAddress === ZeroAddress) {
      isClaimingAchievement = false
      claimBtnFeedbackTxt = 'Please sign in to claim.'
      return
    }
    if (achievement.claimed) {
      isClaimingAchievement = false
      claimBtnFeedbackTxt = 'Achievement already claimed.'
      return
    }
    if (achievement.account !== currentAddress) {
      isClaimingAchievement = false
      claimBtnFeedbackTxt = `Look's like this achievement doesn't belong to you.`
      return
    }

    claimBtnFeedbackTxt = ''
    isClaimingAchievement = true
    const hash = `Claiming Achievement @id${achievementId} @ts:${new Date().getTime()}`
    const signature = await signer
      .signMessage(hash)
      .catch((err: any) => new Error(err))
    if (!signature || !hash || signature instanceof Error) {
      isClaimingAchievement = false
      claimBtnFeedbackTxt = `Wallet signature rejected, try again.`
      return
    }

    const url = `/api/${meta.id}/achievements/claim`
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    }
    const body = JSON.stringify({
      message: hash,
      signature,
      achievementItemId: achievementId,
    })
    const res = await fetch(url, { method: 'POST', headers, body })
      .then(
        (res) => {
          if (res.ok) {
            return res
          }
          throw new Error('Error ' + res.status + ': ' + res.statusText)
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
        (res) => res as { id: string; claimedSBTTokenId: string },
        (err) => {
          throw new Error(err.message)
        },
      )
      .catch((err) => {
        //@TODO: handle error state
        return err
      })

    if (!(res instanceof Error)) {
      if (res?.id && res?.claimedSBTTokenId) {
        achievement.claimed = true
        achievement.claimedSBTTokenId = res.claimedSBTTokenId
        claimBtnFeedbackTxt = 'This achievement is claimed.'
      } else {
        claimBtnFeedbackTxt = 'Error occured, try agian or contact support.'
      }
    } else {
      claimBtnFeedbackTxt = 'Error occured, try agian or contact support.'
    }

    isClaimingAchievement = false
  }

  onMount(() => {
    i18n = i18nBase(navigator.languages)
    connectOnMount()
    fetchAchievement()
  })
</script>

<section
  class="flex flex-col rounded-2xl p-4 gap-8 items-center shadow bg-dp-white-200 text-dp-white-ink"
>
  <h2 class="text-4xl font-bold">
    {i18n('Achievement')} #{achievementId}
  </h2>

  {#if isAchievementDataNotFetched}
    <div
      class="rounded-[19px] p-4 border-[1px] min-w-[41%] w-[41%] max-w-full border-black/20 bg-black/10"
    >
      <h2 class="text-2xl font-bold">
        {i18n('AchievementDataNotFound')}
      </h2>
    </div>
  {/if}

  {#if !isAchievementDataNotFetched}
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
        on:click|preventDefault={claimAchievement}
        disabled={!achievementId ||
          !signer ||
          !currentAddress ||
          currentAddress === ZeroAddress ||
          !achievement ||
          achievement?.account !== currentAddress ||
          achievement.claimed}
        class={`w-full px-4 py-3 mb-1 hs-button is-filled cursor-pointer rounded font-bold text-2xl border-[3px]
          ${isFetchingAchievementData || isClaimingAchievement ? 'animate-pulse bg-gray-500/60' : ''}
          ${achievement?.claimed || (achievement?.account !== currentAddress && currentAddress && currentAddress !== ZeroAddress) ? 'line-through' : ''}`}
      >
        {isClaimingAchievement ? 'Claiming' : 'Claim'}
      </button>
      <p
        class={`text-center w-full text-base font-medium ${!currentAddress || currentAddress === ZeroAddress ? 'text-[#FF3815]' : 'text-black'}`}
      >
        {claimBtnFeedbackTxt}
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
        {achievement?.metadata?.description}
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
  {/if}
</section>
