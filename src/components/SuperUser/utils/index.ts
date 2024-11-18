import type { Ref } from 'vue'
import type { Override } from '@devprotocol/clubs-plugin-payments'

export type RefPassportOverride = Ref<Partial<Override>>

export type RefApiCalling = Ref<
  | {
      result?: any
      error?: string
      progress?: boolean
    }
  | undefined
>
