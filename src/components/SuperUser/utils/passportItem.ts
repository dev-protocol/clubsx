import { whenDefined } from '@devprotocol/util-ts'
import type { RefApiCalling } from '.'
import type { Ref } from 'vue'
import type { CreatePassportItemReq } from '@devprotocol/clubs-plugin-passports'

export type RefPassportItem = Ref<
  Partial<CreatePassportItemReq['passportItem']>
>

export const callAddPassportItem = async (
  ref: RefPassportItem,
  call: RefApiCalling,
  options: { site: string; signature: string; message: string },
) => {
  call.value = { progress: true }
  const api = await whenDefined(ref.value, (data) =>
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
  const res = (await api?.json()) as { res?: string | null; error?: string }
  call.value = { progress: false, result: res, error: res.error }
}
