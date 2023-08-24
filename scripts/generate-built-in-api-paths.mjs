import { glob } from 'glob'
import { outputFileSync } from 'fs-extra/esm'
import { execSync } from 'child_process'

const paths = await glob('src/pages/api/**/*')
console.log({ paths })
/**
 * `paths` will be like...
 * [
    'src/pages/api/verifySiteName',
    'src/pages/api/updateDraftConfig.ts',
    'src/pages/api/updateConfig.ts',
    'src/pages/api/stats.ts',
    'src/pages/api/profile',
    'src/pages/api/plugins',
    'src/pages/api/mock',
    'src/pages/api/hasCreationLimitReached',
    'src/pages/api/fetchClubs.ts',
    'src/pages/api/encrypt.ts',
    'src/pages/api/decrypt.ts',
    'src/pages/api/addDaoToDraft.ts',
    'src/pages/api/verifySiteName/[...site].ts',
    'src/pages/api/profile/index.ts',
    'src/pages/api/profile/[id].ts',
    'src/pages/api/plugins/installablePlugins.ts',
    'src/pages/api/plugins/index.ts',
    'src/pages/api/plugins/addPluginToClub.ts',
    'src/pages/api/mock/access-control.ts',
    'src/pages/api/hasCreationLimitReached/util.ts',
    'src/pages/api/hasCreationLimitReached/[...identifier].ts'
  ]
 */

const firstPaths = Array.from(
  // Exclude duplicates with Set
  new Set(
    paths
      // Remove src/pages/api/
      .map((path) => path.replace('src/pages/api/', ''))
      // Remove extensions
      .map((path) => path.replace(/\.(.+)$/, ''))
      // Remove deep paths
      .map((path) => path.split('/')[0]),
  ),
)
console.log({ firstPaths })

outputFileSync(
  'built-in-api-paths.js',
  `export default ${JSON.stringify(firstPaths)}`,
)

execSync('npx prettier -w built-in-api-paths.js')
