import fs from 'fs-extra'

const pathRequestTransform =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
const pathEntrypoint =
  './node_modules/@astrojs/vercel/dist/serverless/entrypoint.js'

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

// Add duplex option (ref: https://github.com/nodejs/node/issues/46221)
fs.outputFileSync(
  pathRequestTransform,
  ((file) =>
    file.replace(
      `body: get_raw_body(req, bodySizeLimit)`,
      `body: get_raw_body(req, bodySizeLimit), ...{duplex: 'half'}`
    ))(fs.readFileSync(pathRequestTransform, 'utf8'))
)

// Add error logger
fs.outputFileSync(
  pathEntrypoint,
  ((file) =>
    file.replace(
      `err.status || 400`,
      `(()=> { console.log({err}); return err.status || 400;})()`
    ))(fs.readFileSync(pathEntrypoint, 'utf8'))
)
