import type { Ref } from 'vue'
import type { ContractRunner, Signer } from 'ethers'
import { clientsSTokens } from '@devprotocol/dev-kit'
import { whenDefinedAll, type UndefinedOr } from '@devprotocol/util-ts'
import {
  bytes32Hex,
  membershipToStruct,
  type ClubsConfiguration,
  type Membership,
} from '@devprotocol/clubs-core'
import type {
  PassportItemAssetType,
  PassportOffering,
} from '@devprotocol/clubs-plugin-passports/src/types'

import {
  address,
  callSimpleCollections,
} from '@plugins/memberships/utils/simpleCollections'
import { Prices } from '@devprotocol/clubs-plugin-passports'
import type { RefPassportItem } from './passportItem'
import type {
  RefPassportDiscount,
  RefPassportDiscountRate,
} from './passportDiscount'

export type RefPassportOffering = Ref<Partial<PassportOffering>>

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

export const changePassportItemAssetType =
  (
    itemRef: RefPassportItem,
    offeringRef: RefPassportOffering,
    discountRef: RefPassportDiscount,
    discountRateRef: RefPassportDiscountRate,
  ) =>
  (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value
    if (!value) {
      return
    }

    itemRef.value = {
      ...itemRef.value,
      itemAssetType: value as PassportItemAssetType,
    }

    offeringRef.value = {
      ...offeringRef.value,
      price: Prices[value as PassportItemAssetType].usdc,
      currency: 'USDC',
    }

    const usdcPrice = Prices[value as PassportItemAssetType].usdc
    const yenPrice = Prices[value as PassportItemAssetType].yen
    discountRef.value = {
      ...discountRef.value,
      price: {
        usdc: usdcPrice - usdcPrice * discountRateRef.value,
        yen: yenPrice - yenPrice * discountRateRef.value,
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

export const setTokenURIDescriptor = async (
  signer: UndefinedOr<Signer>,
  chainId: UndefinedOr<number>,
  passportItem: RefPassportOffering,
  provider: UndefinedOr<ContractRunner>,
  currentConfig: UndefinedOr<ClubsConfiguration>,
) => {
  if (!provider || !signer) {
    return false
  }

  const [l1, l2] = await clientsSTokens(provider ?? signer)
  const sTokensManager = l1 ?? l2
  const customDescriptorAddress = address.find(
    ({ chainId: chainId_ }) => chainId_ === chainId,
  )?.address

  return (
    (await whenDefinedAll(
      [
        sTokensManager,
        currentConfig,
        customDescriptorAddress,
        passportItem.value.payload,
      ],
      ([cont, conf, descriptorAddress, payload]) =>
        cont
          .setTokenURIDescriptor(conf.propertyAddress, descriptorAddress, [
            bytes32Hex(payload),
          ])
          .then((res) => res.wait())
          .then((res) => res?.status)
          .then((res) => (res ? true : false))
          .catch((err: Error) => {
            console.error('Error in setTokenURIDescriptor:', err)
            return err
          }),
    )) ?? false
  )
}

export const setImage = async (
  signer: UndefinedOr<Signer>,
  chainId: UndefinedOr<number>,
  passportDiscount: RefPassportDiscount,
  passportOffering: RefPassportOffering,
  provider: UndefinedOr<ContractRunner>,
  currentConfig: UndefinedOr<ClubsConfiguration>,
) => {
  if (!provider || !signer) {
    return false
  }

  return (
    (await whenDefinedAll(
      [
        callSimpleCollections,
        currentConfig,
        passportOffering.value.payload,
        signer,
      ],
      ([func, conf, payload, _signer]) =>
        func(_signer, 'setImages', [
          conf.propertyAddress,
          [
            membershipToStruct(
              {
                ...passportOffering.value,
                currency: 'USDC',
                price:
                  passportDiscount?.value?.price?.usdc ||
                  passportOffering.value.price, // if discount is available use it, else use the price.
              } as Membership,
              chainId as number,
            ),
          ],
          [bytes32Hex(payload)],
        ])
          .then((res) => res.wait())
          .then((res) => res?.status)
          .then((res) => (res ? true : false))
          .catch((err: Error) => err),
    )) ?? false
  )
}
