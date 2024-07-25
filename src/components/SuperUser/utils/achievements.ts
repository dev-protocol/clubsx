import type { ReqBodyAchievement } from '@plugins/achievements/handlers/addAchievement'
import type { Ref } from 'vue'
import type { RefApiCalling } from '.'
import { whenDefined } from '@devprotocol/util-ts'
import type { Achievement } from '@plugins/achievements/types'

export type RefAchievement = Ref<Partial<ReqBodyAchievement['achievement']>>

export const changeRecipients = (ref: RefAchievement) => (ev: Event) => {
  const value = (ev.target as HTMLInputElement).value
  const recipients = value.split('\n')
  ref.value = {
    ...ref.value,
    conditions: { ...ref.value?.conditions, recipients },
  }
}

export const changeMaxRedemptions = (ref: RefAchievement) => (ev: Event) => {
  const value = (ev.target as HTMLInputElement).value
  ref.value = {
    ...ref.value,
    conditions: {
      ...ref.value?.conditions,
      maxRedemptions: Number(value) || undefined,
    },
  }
}

export const resetRecipients = (ref: RefAchievement) => () => {
  ref.value = {
    ...ref.value,
    conditions: { ...ref.value?.conditions, recipients: undefined },
  }
}

export const resetMaxRedemptions = (ref: RefAchievement) => () => {
  ref.value = {
    ...ref.value,
    conditions: { ...ref.value?.conditions, maxRedemptions: undefined },
  }
}

export const changeMetaName = (ref: RefAchievement) => (ev: Event) => {
  const value = (ev.target as HTMLInputElement).value
  value &&
    (ref.value = {
      ...ref.value,
      metadata: {
        ...ref.value.metadata,
        name: value,
      } as Achievement['metadata'],
    })
}

export const changeMetaImage = (ref: RefAchievement) => (ev: Event) => {
  const value = (ev.target as HTMLInputElement).value
  value &&
    (ref.value = {
      ...ref.value,
      metadata: {
        ...ref.value.metadata,
        image: value,
      } as Achievement['metadata'],
    })
}

export const changeMetaDescription = (ref: RefAchievement) => (ev: Event) => {
  const value = (ev.target as HTMLInputElement).value
  value &&
    (ref.value = {
      ...ref.value,
      metadata: {
        ...ref.value.metadata,
        description: value,
      } as Achievement['metadata'],
    })
}

export const callAddAchievement = async (
  ref: RefAchievement,
  call: RefApiCalling,
  options: { site: string; signature: string; message: string },
) => {
  call.value = { progress: true }
  const api = await whenDefined(ref.value, (data) =>
    fetch('/api/superuser/achievements', {
      method: 'POST',
      body: JSON.stringify({
        site: options.site,
        message: options.message,
        signature: options.signature,
        achievement: data,
      }),
    }),
  )
  const res = (await api?.json()) as { ids?: string[]; error?: string }
  call.value = { progress: false, result: res.ids, error: res.error }
}
