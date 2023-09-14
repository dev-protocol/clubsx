import fs from 'fs-extra'

const rewriteFile = (path, rewriter) => {
  const file = fs.readFileSync(path, 'utf8')
  const next = rewriter(file)
  return fs.outputFileSync(path, next)
}

// Rewrite the requested URL
// Note: Requests rewritten by middleware (./middleware.ts) have `x-rewritten-url` header
rewriteFile(
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js',
  (file) =>
    file.replace(
      `base + req.url,`,
      `(()=>req.headers['x-rewritten-url'] ? req.headers['x-rewritten-url'] : base + req.url)(),`,
    ),
)

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * Add the state reinitialization function required when using View Transitions API and `@web3modal/wagmi/vue` together.
 *
 * The function is exported as `(@web3modal/wagmi/vue).reinit` and forces the following 2 internal states to be reset:
 * 1. `isInitialized` in @web3modal/scaffold:
 *     Its initialization is necessary to restore `w3m-modal` that was purged by View Transitions.
 * 2. `modal` in @web3modal/wagmi/vue
 *     Its initialization is necessary to re-instantiation `w3m-modal` that was purged by View Transitions.
 * ---------------------------------------------------------------------------------------------------------------------
 */

// Add `(@web3modal/scaffold).reinit` function to purge the internal state `isInitialized`
rewriteFile(
  './node_modules/@web3modal/scaffold/dist/esm/src/client.js',
  (file) => {
    const statement = 'export function reinit(){ isInitialized = undefined; }'
    const transformed = file.includes(statement)
      ? file
      : `${file}\n\n${statement}`
    return transformed
  },
)

// Add export path for `(@web3modal/scaffold).reinit`
rewriteFile('./node_modules/@web3modal/scaffold/dist/esm/index.js', (file) => {
  const transformed = file.replace(
    'export { Web3ModalScaffold }',
    'export { Web3ModalScaffold, reinit }',
  )
  return transformed
})

// Add export path for `(@web3modal/scaffold).reinit` to `@web3modal/wagmi`
rewriteFile(
  './node_modules/@web3modal/wagmi/dist/esm/src/client.js',
  (file) => {
    const $1 = file.replace(
      'import { Web3ModalScaffold }',
      'import { Web3ModalScaffold, reinit }',
    )
    const statement = 'export { reinit }'
    const transformed = $1.includes(statement) ? $1 : `${$1}\n\n${statement}`
    return transformed
  },
)

// Add `(@web3modal/wagmi/vue).reinit` function to purge the internal state `modal` and call `(@web3modal/scaffold).reinit`
rewriteFile(
  './node_modules/@web3modal/wagmi/dist/esm/exports/vue.js',
  (file) => {
    const $1 = file.replace(
      'import { Web3Modal }',
      'import { Web3Modal, reinit as _reinit }',
    )
    const statement =
      'export function reinit(){ _reinit(); modal = undefined; }'
    const transformed = $1.includes(statement) ? $1 : `${$1}\n\n${statement}`
    return transformed
  },
)

// Add type declaration for `(@web3modal/wagmi/vue).reinit` function
rewriteFile(
  './node_modules/@web3modal/wagmi/dist/types/exports/vue.d.ts',
  (file) => {
    const statement = 'export declare function reinit(): void'
    const transformed = file.includes(statement)
      ? file
      : `${file}\n\n${statement}`
    return transformed
  },
)
