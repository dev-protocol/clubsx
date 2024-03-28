<script lang="ts">
  import { onMount } from 'svelte'
  import { ZeroAddress } from 'ethers'
  import type { Signer } from 'ethers'

  import { i18nFactory } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

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
  let isClaimBtnFeedbackTxtColorRed = false
  let claimBtnFeedbackTxt = i18n('SignInMsg')

  const computeClaimBtnTxt = (
    _hasTxErrorOccured: boolean = false,
    _isWalletSigRejected: boolean = false,
    _currentAddress: UndefinedOr<string>,
    _signer: UndefinedOr<Signer>,
    _achievement: UndefinedOr<Achievement>,
  ) => {
    if (_hasTxErrorOccured) {
      claimBtnFeedbackTxt = i18n('TxErrorMsg')
      isClaimBtnFeedbackTxtColorRed = true
      return
    }

    if (_isWalletSigRejected) {
      claimBtnFeedbackTxt = i18n('TxSigRejected')
      isClaimBtnFeedbackTxtColorRed = true
      return
    }

    if (_achievement) {
      if (_achievement.claimed) {
        claimBtnFeedbackTxt = i18n('AlreadyClaimed')
        isClaimBtnFeedbackTxtColorRed = true
        return
      }

      if (
        _signer &&
        _currentAddress &&
        _currentAddress !== ZeroAddress &&
        _achievement.account !== _currentAddress
      ) {
        claimBtnFeedbackTxt = i18n('CantClaimMsg')
        isClaimBtnFeedbackTxtColorRed = true
        return
      }

      if (_signer && _currentAddress && _currentAddress !== ZeroAddress) {
        claimBtnFeedbackTxt = i18n('SignTxMsg')
        isClaimBtnFeedbackTxtColorRed = false
        return
      }
    }

    if (!_currentAddress || !_signer || _currentAddress === ZeroAddress) {
      claimBtnFeedbackTxt = i18n('SignInMsg')
      isClaimBtnFeedbackTxtColorRed = true
    }
  }

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection

    connection().signer.subscribe((s) => {
      computeClaimBtnTxt(false, false, currentAddress, s, achievement)
      signer = s
    })

    connection().account.subscribe((a) => {
      computeClaimBtnTxt(false, false, a, signer, achievement)
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
      `/api/devprotocol:clubs:plugin:achievements/achievement/${achievementId}`,
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
        return err
      })

    if (response && !(response instanceof Error)) {
      achievement = response
      isAchievementDataNotFetched = false
      computeClaimBtnTxt(false, false, currentAddress, signer, achievement)
    }

    isFetchingAchievementData = false
  }

  const claimAchievement = async () => {
    if (!achievementId) {
      isClaimingAchievement = false
      computeClaimBtnTxt(false, false, currentAddress, signer, achievement)
      return
    }
    if (!signer || !currentAddress || currentAddress === ZeroAddress) {
      isClaimingAchievement = false
      computeClaimBtnTxt(false, false, currentAddress, signer, achievement)
      return
    }
    if (achievement.claimed) {
      isClaimingAchievement = false
      computeClaimBtnTxt(false, false, currentAddress, signer, achievement)
      return
    }
    if (achievement.account !== currentAddress) {
      isClaimingAchievement = false
      computeClaimBtnTxt(false, false, currentAddress, signer, achievement)
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
      computeClaimBtnTxt(false, true, currentAddress, signer, achievement)
      return
    }

    const url = `/api/devprotocol:clubs:plugin:achievements/achievements/claim`
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
        computeClaimBtnTxt(true, false, currentAddress, signer, achievement)
        return err
      })

    if (!(res instanceof Error)) {
      if (res?.id && res?.claimedSBTTokenId) {
        achievement.claimed = true
        achievement.claimedSBTTokenId = res.claimedSBTTokenId
        computeClaimBtnTxt(false, false, currentAddress, signer, achievement)
      } else {
        computeClaimBtnTxt(true, false, currentAddress, signer, achievement)
      }
    } else {
      computeClaimBtnTxt(true, false, currentAddress, signer, achievement)
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
  class="grid gap-8 grid-cols-[minmax(auto,32rem)] rounded-2xl p-6 justify-center shadow bg-dp-white-200 text-dp-white-ink"
>
  <h2 class="text-4xl font-bold">
    {i18n('Achievement')} #{achievementId}
  </h2>

  {#if isAchievementDataNotFetched}
    <div class="rounded-md p-4 border border-black/20 bg-black/10">
      <h2 class="text-2xl font-bold">
        {i18n('AchievementDataNotFound')}
      </h2>
    </div>
  {/if}

  {#if !isAchievementDataNotFetched}
    <div class="rounded-md p-4 border border-black/20 bg-black/10">
      {#if isFetchingAchievementData}
        <div class="aspect-square">
          <Skeleton />
        </div>
      {:else}
        <img
          src={achievement?.metadata?.image || AchievementDefaultIcon.src}
          alt="Achievements UI"
          class="h-auto w-full rounded-md object-cover object-center sm:h-full sm:w-full"
        />
      {/if}
    </div>

    {#if achievement?.claimed && achievement?.claimedSBTTokenId > 0 && achievement?.account === currentAddress}
      <div class="flex flex-col items-center gap-2">
        <p class="w-full max-w-full text-3xl font-medium text-center">
          {i18n('Congratulations')}
        </p>
        <p class="w-full max-w-full text-xl font-medium text-center">
          {i18n('YouAreNowHolding') + ' ' + achievement?.metadata?.name}
        </p>
        <div
          class="w-full max-w-full p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal"
        >
          {achievement?.metadata?.description}
        </div>
      </div>
    {:else}
      <span class="grid gap-2">
        <button
          on:click|preventDefault={claimAchievement}
          disabled={!achievementId ||
            !signer ||
            !currentAddress ||
            currentAddress === ZeroAddress ||
            !achievement ||
            achievement?.account !== currentAddress ||
            achievement.claimed}
          class={`w-full px-4 py-3 hs-button is-filled font-bold text-2xl
            ${isFetchingAchievementData || isClaimingAchievement ? 'animate-pulse bg-gray-500/60' : ''}
            ${
              (achievement && achievement?.claimed) ||
              (achievement &&
                achievement?.account !== currentAddress &&
                currentAddress &&
                currentAddress !== ZeroAddress)
                ? 'line-through'
                : ''
            }`}
        >
          {isClaimingAchievement ? 'Claiming' : 'Claim'}
        </button>
        {#if isFetchingAchievementData}
          <Skeleton />
        {:else}
          <p
            class={`text-center w-full text-base font-medium ${isClaimBtnFeedbackTxtColorRed ? 'text-[#FF3815]' : 'text-black'}`}
          >
            {claimBtnFeedbackTxt}
          </p>
        {/if}
      </span>
    {/if}

    <div class="text-3xl font-medium">
      {#if isFetchingAchievementData}
        <Skeleton />
      {:else}
        {achievement?.metadata?.name}
      {/if}
    </div>

    <div class="p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal">
      {#if isFetchingAchievementData}
        <Skeleton />
      {:else}
        {achievement?.metadata?.description}
      {/if}
    </div>

    <div class="text-3xl font-medium">Metadata</div>

    <section
      class="p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal flex flex-col items-start gap-4"
    >
      {#if isFetchingAchievementData || !achievement?.metadata?.numberAttributes || !achievement?.metadata?.stringAttributes}
        <Skeleton />
      {:else}
        {#each achievement?.metadata?.numberAttributes as data, i}
          <div class="flex w-full justify-between items-start">
            <p class="text-base font-normal">{data.trait_type}</p>
            <p class="text-base font-bold">
              {data.display_type === 'number'
                ? new Intl.NumberFormat('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 3,
                  }).format(Number(data.value) || 0)
                : data.value}
            </p>
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
