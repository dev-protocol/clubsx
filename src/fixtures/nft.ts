import { decodeBase64, toUtf8String } from 'ethers'
import { tryCatch } from 'ramda'

export const decodeTokenURI = (uri: string) => {
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
    attributes: ReadonlyArray<{ [key: string]: any }>
  } = tryCatch(
    (m: string) => JSON.parse(m),
    (err) => {
      console.error(err)
      return {}
    },
  )(decoded)

  return metadata
}
