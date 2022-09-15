import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      'base + req.url',
      `((paths)=> paths.length > 3 ? base + '/sites_/' + paths[0] + req.url : base + req.url)(base.replace('https://', '').split('.'))`
    ))(fs.readFileSync(path, 'utf8'))
)
