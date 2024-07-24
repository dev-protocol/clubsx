import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import { decodeBase64, toUtf8String } from 'ethers'
import { tryCatch } from 'ramda'

export const decodeTokenURI = (
  uri: string,
  whenIpfs?: (cid: string) => string,
) => {
  const decoded = uri.startsWith('data')
    ? toUtf8String(
        decodeBase64(
          uri
            .replace(
              /^data(\s+)?:(\s+)?application(\s+)?\/(\s+)?json(\s+)?;(\s+)?base64(\s+)?,(.*)/,
              '$8',
            )
            .trim(),
        ),
      )
    : uri

  const metadata: {
    name?: string
    description?: string
    image?: string
    attributes?: ReadonlyArray<{ [key: string]: any }>
    htmlImageSrc?: string
  } = tryCatch(
    (m: string) => JSON.parse(m),
    (err) => {
      console.error(err)
      return {}
    },
  )(decoded)

  const imageUri = whenDefined(metadata.image, (img) => new URL(img))

  const res = whenDefinedAll(
    [whenIpfs, imageUri?.protocol === 'ipfs:' ? imageUri : undefined],
    ([transform, ipfs]) => ({
      ...metadata,
      htmlImageSrc: transform(ipfs.pathname.replace('//', '')),
    }),
  ) ?? {
    ...metadata,
    htmlImageSrc: metadata.image,
  }

  return res
}
