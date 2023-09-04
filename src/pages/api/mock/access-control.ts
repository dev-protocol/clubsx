import type { APIRoute } from 'astro'

export const get: APIRoute = async ({ url }) => {
  const result = url.searchParams.get('result') // `1` or `0`
  return new Response(result, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
