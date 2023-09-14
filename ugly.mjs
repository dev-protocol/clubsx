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
      `(()=>req.headers['x-rewritten-url'] ? req.headers['x-rewritten-url'] : base + req.url)(),`,
    ))(fs.readFileSync(pathRequestTransform, 'utf8')),
)

const pathWeb3ModalScaffoldClient =
  './node_modules/@web3modal/scaffold/dist/esm/src/client.js'
fs.outputFileSync(
  pathWeb3ModalScaffoldClient,
  ((file) => {
    const statement = 'export function reinit(){ isInitialized = undefined; }'
    const transformed = file.includes(statement)
      ? file
      : `${file}\n\n${statement}`
    return transformed
  })(fs.readFileSync(pathWeb3ModalScaffoldClient, 'utf8')),
)

const pathWeb3ModalScaffold =
  './node_modules/@web3modal/scaffold/dist/esm/index.js'
fs.outputFileSync(
  pathWeb3ModalScaffold,
  ((file) => {
    const transformed = file.replace(
      'export { Web3ModalScaffold }',
      'export { Web3ModalScaffold, reinit }',
    )
    return transformed
  })(fs.readFileSync(pathWeb3ModalScaffold, 'utf8')),
)

const pathWeb3ModalWagmiClient =
  './node_modules/@web3modal/wagmi/dist/esm/src/client.js'
fs.outputFileSync(
  pathWeb3ModalWagmiClient,
  ((file) => {
    const $1 = file.replace(
      'import { Web3ModalScaffold }',
      'import { Web3ModalScaffold, reinit }',
    )
    const statement = 'export { reinit }'
    const transformed = $1.includes(statement) ? $1 : `${$1}\n\n${statement}`
    return transformed
  })(fs.readFileSync(pathWeb3ModalWagmiClient, 'utf8')),
)

const pathWeb3ModalVue =
  './node_modules/@web3modal/wagmi/dist/esm/exports/vue.js'
fs.outputFileSync(
  pathWeb3ModalVue,
  ((file) => {
    const $1 = file.replace(
      'import { Web3Modal }',
      'import { Web3Modal, reinit as _reinit }',
    )
    const statement =
      'export function reinit(){ _reinit(); modal = undefined; }'
    const transformed = $1.includes(statement) ? $1 : `${$1}\n\n${statement}`
    return transformed
  })(fs.readFileSync(pathWeb3ModalVue, 'utf8')),
)

const pathWeb3ModalVueDT =
  './node_modules/@web3modal/wagmi/dist/types/exports/vue.d.ts'
fs.outputFileSync(
  pathWeb3ModalVueDT,
  ((file) => {
    const statement = 'export declare function reinit(): void'
    const transformed = file.includes(statement)
      ? file
      : `${file}\n\n${statement}`
    return transformed
  })(fs.readFileSync(pathWeb3ModalVueDT, 'utf8')),
)
