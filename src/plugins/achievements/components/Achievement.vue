<script lang="ts" setup>
import { onMounted, ref, computed, toRaw } from 'vue'
import { ZeroAddress, type Signer } from 'ethers'

import { i18nFactory } from '@devprotocol/clubs-core'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { connection as Connection } from '@devprotocol/clubs-core/connection'

import { meta } from '../index'
import { Strings } from '../i18n'
import type { Achievement } from '../types'
import Skeleton from '@components/Global/Skeleton.vue'
import AchievementDefaultIcon from '../assets/achievement.svg'

const i18nBase = i18nFactory(Strings)
let i18n = i18nBase(['en'])

type Props = {
  achievementId: string
}

const props = defineProps<Props>()

const achievement = ref<Achievement>()
const signer = ref<Signer | undefined>()
const connection = ref<typeof Connection>()
const currentAddress = ref<string | undefined>()

const isClaimingAchievement = ref<boolean>(false)
const isFetchingAchievementData = ref<boolean>(false)
const isAchievementDataNotFetched = ref<boolean>(false)
const isClaimBtnFeedbackTxtColorRed = ref<boolean>(false)
const claimBtnFeedbackTxt = ref<string>(i18n('SignInMsg'))

function computeClaimBtnTxt(
  _hasTxErrorOccured: boolean = false,
  _isWalletSigRejected: boolean = false,
  _currentAddress: UndefinedOr<string>,
  _signer: UndefinedOr<Signer>,
  _achievement: UndefinedOr<Achievement>,
) {
  if (_hasTxErrorOccured) {
    claimBtnFeedbackTxt.value = i18n('TxErrorMsg')
    isClaimBtnFeedbackTxtColorRed.value = true
    return
  }

  if (_isWalletSigRejected) {
    claimBtnFeedbackTxt.value = i18n('TxSigRejected')
    isClaimBtnFeedbackTxtColorRed.value = true
    return
  }

  if (_achievement) {
    if (_achievement.claimed) {
      claimBtnFeedbackTxt.value = i18n('AlreadyClaimed')
      isClaimBtnFeedbackTxtColorRed.value = true
      return
    }

    if (
      _signer &&
      _currentAddress &&
      _currentAddress !== ZeroAddress &&
      _achievement.account !== _currentAddress
    ) {
      claimBtnFeedbackTxt.value = i18n('CantClaimMsg')
      isClaimBtnFeedbackTxtColorRed.value = true
      return
    }

    if (_signer && _currentAddress && _currentAddress !== ZeroAddress) {
      claimBtnFeedbackTxt.value = i18n('SignTxMsg')
      isClaimBtnFeedbackTxtColorRed.value = false
      return
    }
  }

  if (!_currentAddress || !_signer || _currentAddress === ZeroAddress) {
    claimBtnFeedbackTxt.value = i18n('SignInMsg')
    isClaimBtnFeedbackTxtColorRed.value = true
  }
}

async function connectOnMount() {
  const _connection = await import('@devprotocol/clubs-core/connection')
  connection.value = _connection.connection

  connection.value().signer.subscribe((s) => {
    computeClaimBtnTxt(false, false, currentAddress.value, s, achievement.value)
    signer.value = s
  })

  connection.value().account.subscribe((a) => {
    computeClaimBtnTxt(false, false, a, signer.value, achievement.value)
    currentAddress.value = a
  })
}

async function fetchAchievement() {
  if (!props.achievementId) {
    isFetchingAchievementData.value = false
    isAchievementDataNotFetched.value = true
    return
  }

  isFetchingAchievementData.value = true
  isAchievementDataNotFetched.value = false

  const response = await fetch(
    `/api/${meta.id}/achievement/${props.achievementId}`,
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
      isAchievementDataNotFetched.value = true
      return undefined
    })

  if (response) {
    achievement.value = response
    isAchievementDataNotFetched.value = false
    computeClaimBtnTxt(
      false,
      false,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
  }

  isFetchingAchievementData.value = false
}

async function claimAchievement() {
  if (!props.achievementId) {
    isClaimingAchievement.value = false
    computeClaimBtnTxt(
      false,
      false,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
    return
  }
  if (!achievement.value) {
    isClaimingAchievement.value = false
    computeClaimBtnTxt(
      false,
      false,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
    return
  }
  if (
    !signer.value ||
    !currentAddress.value ||
    currentAddress.value === ZeroAddress
  ) {
    isClaimingAchievement.value = false
    computeClaimBtnTxt(
      false,
      false,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
    return
  }
  if (achievement.value.claimed) {
    isClaimingAchievement.value = false
    computeClaimBtnTxt(
      false,
      false,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
    return
  }
  if (achievement.value.account !== currentAddress.value) {
    isClaimingAchievement.value = false
    computeClaimBtnTxt(
      false,
      false,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
    return
  }

  claimBtnFeedbackTxt.value = ''
  isClaimingAchievement.value = true
  const hash = `Claiming Achievement @id${props.achievementId} @ts:${new Date().getTime()}`
  const rawSignerInstance = toRaw(signer.value)
  const signature = await rawSignerInstance
    .signMessage(hash)
    .catch((err: any) => {
      return new Error(err)
    })
  if (!signature || !hash || signature instanceof Error) {
    isClaimingAchievement.value = false
    computeClaimBtnTxt(
      false,
      true,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
    return
  }

  const url = `/api/${meta.id}/achievements/claim`
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  }
  const body = JSON.stringify({
    message: hash,
    signature,
    achievementItemId: props.achievementId,
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
      computeClaimBtnTxt(
        true,
        false,
        currentAddress.value,
        signer.value,
        achievement.value,
      )
      return err
    })

  if (!(res instanceof Error)) {
    if (res?.id && res?.claimedSBTTokenId) {
      achievement.value.claimed = true
      achievement.value.claimedSBTTokenId = res.claimedSBTTokenId
      computeClaimBtnTxt(
        false,
        false,
        currentAddress.value,
        signer.value,
        achievement.value,
      )
    } else {
      computeClaimBtnTxt(
        true,
        false,
        currentAddress.value,
        signer.value,
        achievement.value,
      )
    }
  } else {
    computeClaimBtnTxt(
      true,
      false,
      currentAddress.value,
      signer.value,
      achievement.value,
    )
  }

  isClaimingAchievement.value = false
}

const computedClaimBtnClasses = computed(() => {
  let classes = ''

  if (isFetchingAchievementData.value || isClaimingAchievement.value) {
    classes += ' animate-pulse bg-gray-500/60'
  } else {
    classes += ' '
  }

  if (
    (achievement.value && achievement.value?.claimed) ||
    (achievement.value &&
      achievement.value?.account !== currentAddress.value &&
      currentAddress.value &&
      currentAddress.value !== ZeroAddress)
  ) {
    classes += ' line-through'
  } else {
    classes += ' '
  }

  return classes
})

onMounted(async () => {
  i18n = i18nBase(navigator.languages)
  connectOnMount()
  fetchAchievement()
})
</script>

<template>
  <section
    class="grid gap-8 grid-cols-[minmax(auto,32rem)] rounded-2xl p-6 justify-center shadow bg-dp-white-200 text-dp-white-ink"
  >
    <h2 class="text-4xl font-bold">
      {{ i18n('Achievement') + ' #' + props.achievementId }}
    </h2>

    <div
      v-if="isAchievementDataNotFetched"
      class="rounded-md p-4 border border-black/20 bg-black/10"
    >
      <h2 class="text-2xl font-bold">
        {{ i18n('AchievementDataNotFound') }}
      </h2>
    </div>

    <div
      v-if="!isAchievementDataNotFetched"
      class="rounded-md p-4 border border-black/20 bg-black/10"
    >
      <div v-if="isFetchingAchievementData" class="aspect-square">
        <Skeleton />
      </div>
      <img
        v-else
        :src="achievement?.metadata?.image || AchievementDefaultIcon.src"
        alt="Achievements UI"
        class="h-auto w-full rounded-md object-cover object-center sm:h-full sm:w-full"
      />
    </div>

    <div
      v-if="
        !isAchievementDataNotFetched &&
        achievement?.claimed &&
        achievement?.claimedSBTTokenId > 0 &&
        achievement?.account === currentAddress
      "
      class="flex flex-col items-center gap-2"
    >
      <p class="w-full max-w-full text-3xl font-medium text-center">
        {{ i18n('Congratulations') }}
      </p>
      <p class="w-full max-w-full text-xl font-medium text-center">
        {{ i18n('YouAreNowHolding') + ' ' + achievement?.metadata?.name }}
      </p>
      <div
        class="w-full max-w-full p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal"
      >
        {{ achievement?.metadata?.description }}
      </div>
    </div>
    <span v-else class="grid gap-2">
      <button
        @click="claimAchievement"
        :disabled="
          !props.achievementId ||
          !signer ||
          !currentAddress ||
          currentAddress === ZeroAddress ||
          !achievement ||
          achievement?.account !== currentAddress ||
          achievement.claimed
        "
        class="w-full px-4 py-3 hs-button is-filled font-bold text-2xl"
        :class="computedClaimBtnClasses"
      >
        {{ isClaimingAchievement ? 'Claiming' : 'Claim' }}
      </button>
      <Skeleton v-if="isFetchingAchievementData" />
      <p
        v-else
        class="text-center w-full text-base font-medium"
        v-bind:class="
          isClaimBtnFeedbackTxtColorRed ? 'text-[#FF3815]' : 'text-black'
        "
      >
        {{ claimBtnFeedbackTxt }}
      </p>
    </span>

    <div v-if="isFetchingAchievementData" class="text-3xl font-medium">
      <Skeleton />
    </div>
    <div v-else class="text-3xl font-medium">
      {{ achievement?.metadata?.name }}
    </div>

    <div
      v-if="isFetchingAchievementData"
      class="p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal"
    >
      <Skeleton />
    </div>
    <div v-else class="p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal">
      {{ achievement?.metadata?.description }}
    </div>

    <div class="text-3xl font-medium">Metadata</div>

    <section
      class="p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal flex flex-col items-start gap-4"
    >
      <Skeleton
        v-if="
          isFetchingAchievementData ||
          !achievement?.metadata?.numberAttributes ||
          !achievement?.metadata?.stringAttributes
        "
      />
      <div v-else class="flex flex-col w-full max-w-full gap-4">
        <div class="flex flex-col w-full max-w-full gap-4">
          <div
            v-for="data in achievement?.metadata?.numberAttributes"
            class="flex w-full justify-between items-start"
          >
            <p class="text-base font-normal">{{ data.trait_type }}</p>
            <p class="text-base font-bold">
              {{
                data.display_type === 'number'
                  ? new Intl.NumberFormat(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 3,
                    }).format(Number(data.value) || 0)
                  : data.value
              }}
            </p>
          </div>
        </div>
        <div class="flex flex-col w-full max-w-full gap-4">
          <div
            v-for="data in achievement?.metadata?.stringAttributes"
            class="flex w-full justify-between items-start"
          >
            <p class="text-base font-normal">{{ data.trait_type }}</p>
            <p class="text-base font-bold">{{ data.value }}</p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
