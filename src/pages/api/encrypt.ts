import { sign } from 'jsonwebtoken-esm'

export const post = async ({ request }: { request: Request }) => {
  const { text } = (await request.json()) as {
    text: string
  }

  const encrypted = sign(text, process.env.SALT ?? '')

  return new Response(JSON.stringify({ encrypted }), { status: 200 })
}
