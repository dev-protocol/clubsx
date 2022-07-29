import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      'base + req.url',
      `((_h)=>(_h.length < 4 ? base : base + '/_sites/' + _h[0]) + req.url)(headers['host'].split('.'))`
    ))(fs.readFileSync(path, 'utf8'))
)
