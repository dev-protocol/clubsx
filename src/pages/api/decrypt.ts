import { verify } from 'jsonwebtoken'

export const post = async ({ request }: { request: Request }) => {
  const { encryptedText } = (await request.json()) as {
    encryptedText: string
  }

  let decoded = verify(encryptedText, process.env.SALT ?? '')

  return new Response(
    JSON.stringify({
      decoded,
    }),
    { status: 200 }
  )
}
