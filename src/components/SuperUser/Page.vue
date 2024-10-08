<script lang="ts" setup>
import { randomBytes } from 'ethers'
import {
  bytes32Hex,
  type ClubsOffering,
  decode,
  encode,
} from '@devprotocol/clubs-core'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import type { Signer } from 'ethers'
import { combineLatest } from 'rxjs'
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import type { ReqBodyAchievement } from '@plugins/achievements/handlers/addAchievement'
import type { CreatePassportItemReq } from '@devprotocol/clubs-plugin-passport'

import {
  callAddAchievement,
  changeMaxRedemptions,
  changeMetaDescription,
  changeMetaImage,
  changeMetaName,
  changeRecipients,
  resetMaxRedemptions,
  resetRecipients,
} from './utils/achievements'
import type { RefApiCalling } from './utils'
import { callAddPassportItem } from './utils/passportItem'
import { changePassportOfferingFee } from './utils/passportOffering'

dayjs.extend(utc)

let signerObj: UndefinedOr<Signer>
const props = defineProps<{ plugins: { id: string; name: string }[] }>()
const account = ref<string>()
const club = ref<string>()
const message = () => `I'm a superuser @ts:${dayjs().utc().toDate().getTime()}`
const apiCalling: RefApiCalling = ref<{
  result?: any
  error?: string
  progress?: boolean
}>()
const plugins = ref(
  props.plugins.map((plg) => ({
    ...plg,
    willInstall: false,
    willUninstall: false,
  })),
)

const passportPayload = ref<Uint8Array>()
const passportOffering = ref<Partial<ClubsOffering>>({})
const achievement = ref<Partial<ReqBodyAchievement['achievement']>>({})
const passportItem = ref<Partial<CreatePassportItemReq['passportItem']>>({})

const sign = async () => {
  const msg = message()
  const sig = await signerObj?.signMessage(msg)
  return { signature: sig, message: msg }
}
const fetchClubs = async (
  site: string,
): Promise<{ content: string | null; message: string }> =>
  fetch(`/api/config/${site}`).then((r) => r.json())

const install = async () => {
  const { signature: sig, message: msg } = await sign()
  apiCalling.value = { progress: true }
  const installPlugins = plugins.value.filter(
    ({ willInstall }) => willInstall === true,
  )
  const ids = installPlugins.map(({ id }) => id)
  const currentConfig = whenDefined(
    (await whenDefined(club.value, fetchClubs))?.content,
    decode,
  )
  const nextConfig = whenDefined(currentConfig, (base) => ({
    ...base,
    plugins: [
      ...base.plugins.filter(({ id }) => ids.includes(id) === false),
      ...installPlugins.map(({ id }) => ({ id, options: [] })),
    ],
  }))
  console.log({
    installPlugins,
    currentConfig,
    nextConfig,
  })
  const api = await whenDefined(nextConfig, (conf) =>
    fetch('/api/superuser/config', {
      method: 'POST',
      body: JSON.stringify({
        site: club.value,
        message: msg,
        signature: sig,
        config: encode(conf),
      }),
    }),
  )
  const res = (await api?.json()) as { result: string; error?: string }
  apiCalling.value = { progress: false, result: res.result, error: res.error }
}

const addAchievement = async () => {
  const { signature: sig, message: msg } = await sign()
  callAddAchievement(achievement, apiCalling, {
    site: club.value ?? '',
    signature: sig ?? '',
    message: msg,
  })
}

const onChangeMaxRedemptions = changeMaxRedemptions(achievement)
const onChangeRecipients = changeRecipients(achievement)
const onChangeName = changeMetaName(achievement)
const onChangeImage = changeMetaImage(achievement)
const onChangeDesc = changeMetaDescription(achievement)
const onResetRecipients = resetRecipients(achievement)
const onResetMaxRedemptions = resetMaxRedemptions(achievement)

const addPassportItem = async () => {
  const { signature: sig, message: msg } = await sign()
  callAddPassportItem(passportItem, apiCalling, {
    site: club.value ?? '',
    signature: sig ?? '',
    message: msg,
  })
}

const onChangePassportOfferingFee = changePassportOfferingFee(
  passportOffering,
  account.value,
)

onMounted(async () => {
  passportPayload.value = randomBytes(8)

  passportOffering.value = {
    ...passportOffering.value,
    payload: bytes32Hex(passportPayload.value),
  }
  passportItem.value = {
    ...passportItem.value,
    sTokenPayload: bytes32Hex(passportPayload.value),
  }

  const { connection } = await import('@devprotocol/clubs-core/connection')
  combineLatest([connection().signer, connection().account]).subscribe(
    ([_signer, _account]) => {
      signerObj = _signer
      account.value = _account
    },
  )
})
</script>

<template>
  <div class="grid gap-8 grid-cols-2">
    <div class="grid gap-8 justify-start justify-items-start">
      <label class="hs-form-field is-filled">
        <span class="hs-form-field__label">Target Club</span>
        <input type="text" v-model="club" class="hs-form-field__input" />
      </label>

      <h2 class="font-mono text-xl mt-8">Install Plugins</h2>
      <form class="grid gap-2">
        <label v-for="plugin of plugins" :for="plugin.id"
          ><input
            type="checkbox"
            v-model="plugin.willInstall"
            :id="plugin.id"
            :name="plugin.name"
            :checked="plugin.willInstall"
          />
          {{ plugin.name }}</label
        >
      </form>

      <h2 class="font-mono text-xl mt-8">Add Acheievement</h2>
      <div class="grid gap-2">
        <label class="hs-form-field">
          <span class="hs-form-field__label">Contract</span>
          <input
            type="text"
            class="hs-form-field__input"
            v-model="achievement.contract"
          />
        </label>
        <label class="hs-form-field">
          <span class="hs-form-field__label">Conditions - maxRedemptions</span>
          <span class="flex gap-2 items-center">
            <input
              type="number"
              class="hs-form-field__input"
              :value="achievement.conditions?.maxRedemptions"
              @change="onChangeMaxRedemptions"
              @keyup="onChangeMaxRedemptions"
            />
            <button
              class="hs-button is-outlined is-small"
              @click="onResetMaxRedemptions"
            >
              Reset
            </button>
          </span>
        </label>
        <label class="hs-form-field">
          <span class="hs-form-field__label">Conditions - recipients</span>
          <span class="flex gap-2 items-center">
            <textarea
              class="hs-form-field__input"
              :value="achievement.conditions?.recipients?.join('\n')"
              @keyup="onChangeRecipients"
            />
            <button
              class="hs-button is-outlined is-small"
              @click="onResetRecipients"
            >
              Reset
            </button>
          </span>
        </label>
        <label class="hs-form-field">
          <span class="hs-form-field__label">Name</span>
          <input
            type="text"
            class="hs-form-field__input"
            @change="onChangeName"
            @keyup="onChangeName"
          />
        </label>
        <label class="hs-form-field">
          <span class="hs-form-field__label">Image URL</span>
          <input
            type="text"
            class="hs-form-field__input"
            @change="onChangeImage"
            @keyup="onChangeImage"
          />
        </label>
        <label class="hs-form-field">
          <span class="hs-form-field__label">Description</span>
          <input
            type="text"
            class="hs-form-field__input"
            @change="onChangeDesc"
            @keyup="onChangeDesc"
          />
        </label>
      </div>

      <h2 class="font-mono text-xl mt-8">Add Passport Offering</h2>
      <div class="w-full grid gap-2">
        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Name</span>
          <input
            type="text"
            class="w-full hs-form-field__input"
            v-model="passportOffering.name"
          />
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Image URL</span>
          <input
            type="text"
            class="w-full hs-form-field__input"
            v-model="passportOffering.imageSrc"
          />
        </label>

        // TODO: keep price constant depending on assets.
        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Price</span>
          <input
            type="number"
            min="0.000001"
            max="1.000e+20"
            class="w-full hs-form-field__input"
            v-model="passportOffering.price"
          />
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Currency</span>
          <select
            id="select-offering-currency"
            v-model="passportOffering.currency"
            class="w-full hs-form-field__input"
          >
            <option disabled value="">Select option</option>
            <option value="USDC" class="bg-primary-200 text-primary-ink">
              USDC
            </option>
            <option value="ETH" class="bg-primary-200 text-primary-ink">
              ETH
            </option>
            <option value="MATIC" class="bg-primary-200 text-primary-ink">
              MATIC
            </option>
            <option value="DEV" class="bg-primary-200 text-primary-ink">
              DEV
            </option>
          </select>
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Fee</span>
          <input
            type="number"
            min="0"
            max="1"
            :disabled="!passportOffering.currency"
            :value="passportOffering.fee?.percentage"
            class="w-full hs-form-field__input"
            @change="onChangePassportOfferingFee"
            @keyup="onChangePassportOfferingFee"
          />
          <p class="hs-form-field__helper mt-2">
            * MINIMUM fee is <b>0</b> and MAXIMUM fee is <b>1</b>
          </p>
          <p class="hs-form-field__helper mt-2">
            * Fee has to be <b>0</b> when currency is <b>DEV</b>
          </p>
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Description</span>
          <input
            type="text"
            class="w-full hs-form-field__input"
            v-model="passportOffering.description"
          />
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Payload</span>
          <input
            type="text"
            class="w-full hs-form-field__input"
            v-model="passportOffering.payload"
          />
        </label>
      </div>

      <h2 class="font-mono text-xl mt-8">Add Passport Item</h2>
      <div class="w-full grid gap-2">
        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Id</span>
          <input
            type="text"
            class="w-full hs-form-field__input"
            v-model="passportItem.sTokenId"
          />
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">Payload</span>
          <input
            type="text"
            class="w-full hs-form-field__input"
            v-model="passportItem.sTokenPayload"
          />
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">ItemAssetValue</span>
          <select
            id="select-item-asset"
            v-model="passportItem.itemAssetType"
            class="w-full hs-form-field__input"
          >
            <option disabled value="">Select option</option>
            <option value="css">css</option>
            <option value="stylesheet-link">stylesheet-link</option>
            <option value="image">image</option>
            <option value="image-link">image-link</option>
            <option value="video">video</option>
            <option value="video-link">video-link</option>
            <option value="bgm">bgm</option>
            <option value="bgm-link">bgm-link</option>
          </select>
        </label>

        <label class="w-full hs-form-field">
          <span class="w-full hs-form-field__label">ItemAssetValue</span>
          <input
            type="text"
            class="w-full hs-form-field__input"
            v-model="passportItem.itemAssetValue"
          />
        </label>
      </div>
    </div>

    <aside class="grid gap-2">
      <div class="border border-1 rounded-xl p-4">
        <dl class="grid grid-cols-[auto,1fr] gap-2 gap-y-4">
          <dt class="font-bold">Club</dt>
          <dd>{{ club }}</dd>
          <dt class="font-bold">Install Plugins</dt>
          <dd>
            <p v-for="plugin of plugins.filter((x) => x.willInstall)">
              {{ plugin.name }}
            </p>
            <p>
              <button class="hs-button is-small is-filled" @click="install">
                Install
              </button>
            </p>
          </dd>

          <dt class="font-bold">Add Achievement</dt>
          <dd>
            <pre class="text-sm">{{
              achievement ? JSON.stringify(achievement, null, 2) : ''
            }}</pre>
            <p>
              <button
                class="hs-button is-small is-filled"
                @click="addAchievement"
              >
                Add
              </button>
            </p>
          </dd>

          <dt class="font-bold">Add Passport Offering</dt>
          <dd>
            <pre class="text-sm">{{
              passportOffering ? JSON.stringify(passportOffering, null, 2) : ''
            }}</pre>
            <p>
              <button
                class="hs-button is-small is-filled"
                @click="addPassportItem"
              >
                Add
              </button>
            </p>
          </dd>

          <dt class="font-bold">Add Passport Item</dt>
          <dd>
            <pre class="text-sm">{{
              passportItem ? JSON.stringify(passportItem, null, 2) : ''
            }}</pre>
            <p>
              <button
                class="hs-button is-small is-filled"
                @click="addPassportItem"
              >
                Add
              </button>
            </p>
          </dd>
        </dl>
      </div>
      <div
        v-if="apiCalling && apiCalling.progress !== undefined"
        class="rounded-xl p-4 font-mono"
        :class="
          apiCalling?.error
            ? 'bg-dp-red-300 text-dp-red-ink'
            : apiCalling?.result
              ? 'bg-dp-green-300 text-dp-green-ink'
              : 'bg-surface-300'
        "
      >
        <span v-if="apiCalling?.progress">Now calling API...</span>
        <span v-if="apiCalling?.result">{{ apiCalling.result }}</span>
        <span v-if="apiCalling?.error">{{ apiCalling.error }}</span>
      </div>
    </aside>
  </div>
</template>
