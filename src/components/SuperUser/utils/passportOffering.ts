import type { Ref } from 'vue'
import { ZeroAddress } from 'ethers'
import { whenDefined } from '@devprotocol/util-ts'
import type { ClubsOffering } from '@devprotocol/clubs-core'

import type { RefApiCalling } from '.'

export type RefPassportOffering = Ref<Partial<ClubsOffering>>

export const changePassportOfferingFee =
  (ref: RefPassportOffering, eoa: string | undefined) => (ev: Event) => {
    let value: number = 0
    if (ref.value.currency !== 'DEV') {
      value = Number((ev.target as HTMLInputElement).value)
    }

    ref.value = {
      ...ref.value,
      fee: {
        ...ref.value?.fee,
        percentage: value < 0 ? 0 : value > 1 ? 1 : value,
        beneficiary: ref.value?.fee?.beneficiary ?? eoa ?? ZeroAddress,
      },
    }
  }
