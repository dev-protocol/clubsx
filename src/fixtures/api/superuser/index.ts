import { signatureExpiration, superusers } from '@constants/superuser'
import { verifyMessage } from 'ethers'
import { tryCatch } from 'ramda'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { whenNotError } from '@devprotocol/util-ts'

dayjs.extend(utc)

export const verifiedAccount = ({
  message,
  signature,
}: {
  message: string
  signature: string
}) => {
  const ts = Number(message.replace(/(.*)@ts:([0-9]+$)/, '$2'))
  const now = dayjs().utc().toDate().getTime()
  const isMessageValid = now - signatureExpiration < ts
  console.log({ ts, now, isMessageValid })

  const eoa = isMessageValid
    ? tryCatch(
        (msg: string, sig: string) => verifyMessage(msg, sig).toLowerCase(),
        (err: Error) => err,
      )(message, signature)
    : new Error('Message is expired.')

  const test = whenNotError(eoa, (account) =>
    superusers.some((su) => su.toLowerCase() === account)
      ? account
      : new Error('Invalid access.'),
  )

  return test
}
