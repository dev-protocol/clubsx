import { whenDefined } from '@devprotocol/util-ts'
import type { RefApiCalling } from '.'
import type { Ref } from 'vue'
import type { CreatePassportItemReq } from '@devprotocol/clubs-plugin-passport'

export type RefPassportItem = Ref<
  Partial<CreatePassportItemReq['passportItem']>
>

export const callAddPassportItem = async (
  ref: RefPassportItem,
  call: RefApiCalling,
  options: { site: string; signature: string; message: string },
) => {
  call.value = { progress: true }
  console.log('Data', ref)
  const api = await whenDefined(ref, (data) =>
    fetch('/api/superuser/passportItem', {
      method: 'POST',
      body: JSON.stringify({
        site: options.site,
        message: options.message,
        signature: options.signature,
        passportItem: data,
      }),
    }),
  )
  const res = (await api?.json()) as { ids?: string[]; error?: string }
  call.value = { progress: false, result: res.ids, error: res.error }
}
