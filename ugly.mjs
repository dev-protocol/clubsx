import fs from 'fs-extra'

const pathRequestTransform =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'

// Rewrite the requested URL
fs.outputFileSync(
  pathRequestTransform,
  ((file) =>
    file.replace(
      `base + req.url,`,
      `((reg)=>req.headers['forwarded'] ? req.headers['forwarded'].split(';').find((x)=>reg.test(x))?.replace(reg, '$1') : base + req.url)(/^host=(.*)/i),`,
    ))(fs.readFileSync(pathRequestTransform, 'utf8')),
)
