import type { APIRoute } from 'astro'

export const all: APIRoute = async (event) => {
  console.log('Logger', { event })
  return new Response('', {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
