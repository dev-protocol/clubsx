import jsonwebtoken from 'jsonwebtoken'

export const post = async ({ request }: { request: Request }) => {
  const { text } = (await request.json()) as {
    text: string
  }

  const encrypted = jsonwebtoken.sign(text, process.env.SALT ?? '')

  return new Response(JSON.stringify({ encrypted }), { status: 200 })
}
