import fs from 'fs-extra'

const pathRequestTransform =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'

// Rewrite the requested URL
// Note: Requests rewritten by middleware (./middleware.ts) have `x-rewritten-url` header
fs.outputFileSync(
  pathRequestTransform,
  ((file) =>
    file.replace(
      `base + req.url,`,
      `(()=>headers['x-rewritten-url'] ? headers['x-rewritten-url'] : base + req.url)(),`
    ))(fs.readFileSync(pathRequestTransform, 'utf8'))
)
