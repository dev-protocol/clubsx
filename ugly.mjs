import fs from 'fs-extra'

const pathRequestTransform =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'

// Rewrite the requested URL
fs.outputFileSync(
  pathRequestTransform,
  ((file) =>
    file.replace(
      `base + req.url,`,
      `(()=>req.headers['x-clubs-rewrite'] ? delete req.headers.forwarded && req.headers['x-clubs-rewrite'] : base + req.url)(),`,
    ))(fs.readFileSync(pathRequestTransform, 'utf8')),
)
