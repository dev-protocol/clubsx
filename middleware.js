export function middleware(req) {
  console.log(`req.headers.get('host')`, req.headers.get('host'))
  const [site] = (req.headers.get('host') || 'demo.example.pub').split('.')

  if (site) {
    return new Response(new URL(`/${site}`, req.url))
  }
}
