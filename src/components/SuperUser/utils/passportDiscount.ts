import type { Ref } from 'vue'
import { Prices } from '@devprotocol/clubs-plugin-passports'
import type {
  PassportOffering,
  PassportOptionsDiscount,
} from '@devprotocol/clubs-plugin-passports/src/types'

import type { RefPassportItem } from './passportItem'

export type RefPassportDiscountRate = Ref<number>
export type RefPassportOffering = Ref<Partial<PassportOffering>>
export type RefPassportDiscount = Ref<Partial<PassportOptionsDiscount>>

export const changePassportDiscount =
  (
    discountRef: RefPassportDiscount,
    offeringRef: RefPassportOffering,
    itemRef: RefPassportItem,
    discountRateRef: RefPassportDiscountRate,
  ) =>
  (ev: Event) => {
    const value = Number((ev.target as HTMLInputElement).value)
    if (!value || !offeringRef?.value?.price || !itemRef.value.itemAssetType) {
      return
    }

    discountRateRef.value = value

    const yenPrice = Prices[itemRef.value.itemAssetType].yen
    discountRef.value = {
      ...discountRef.value,
      price: {
        usdc: offeringRef.value.price - offeringRef.value.price * value,
        yen: yenPrice - yenPrice * value,
      },
    }
  }

export const changePassportDiscountStart =
  (discountRef: RefPassportDiscount) => (ev: Event) => {
    const value = new Date((ev.target as HTMLInputElement).value)
    if (!value) {
      return
    }

    discountRef.value = {
      ...discountRef.value,
      start_utc: value.getTime(),
    }
  }

export const changePassportDiscountEnd =
  (discountRef: RefPassportDiscount) => (ev: Event) => {
    const value = new Date((ev.target as HTMLInputElement).value)
    if (!value) {
      return
    }

    discountRef.value = {
      ...discountRef.value,
      end_utc: value.getTime(),
    }
  }
