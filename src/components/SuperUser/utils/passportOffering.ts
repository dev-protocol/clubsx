import type { Ref } from 'vue'
import type { ClubsOffering } from '@devprotocol/clubs-core'

export type RefPassportOffering = Ref<Partial<ClubsOffering>>

export const changePassportOfferingFee =
  (ref: RefPassportOffering) => (ev: Event) => {
    let value: number = 0
    if (ref.value.currency !== 'DEV') {
      value = Number((ev.target as HTMLInputElement).value)
    }

    ref.value = {
      ...ref.value,
      fee: {
        ...ref.value?.fee,
        percentage: value < 0 ? 0 : value > 1 ? 1 : value,
        beneficiary: ref.value?.fee?.beneficiary as string,
      },
    }
  }

export const changePassportOfferingBeneficiary =
  (ref: RefPassportOffering) => (ev: Event) => {
    ref.value = {
      ...ref.value,
      fee: {
        ...ref.value?.fee,
        percentage: ref.value?.fee?.percentage as number,
        beneficiary: (ev.target as HTMLInputElement).value,
      },
    }
  }
