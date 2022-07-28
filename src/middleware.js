export function middleware(req) {
  const [site] = (req.headers.get('host') || 'demo.example.pub').split('.')

  if (site) {
    return new Response(new URL(`/${site}`, req.url))
  }
}
