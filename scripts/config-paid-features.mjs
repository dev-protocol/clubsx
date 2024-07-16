/**
 * ```bash
 * node ./scripts/config-paid-features.mjs --club xxx
 * ```
 */

import { upgrade } from './lib.upgrade.mjs'

const KEY = ((i) => (i > -1 ? process.argv[i + 1] : undefined))(
  process.argv.findIndex((a) => a === '--club'),
)

console.log({ KEY })

const ID = {
  CLUBSPAYMENTS: 'devprotocol:clubs:plugin:clubs-payments',
  AWESOME_ONBOARDING: 'devprotocol:clubs:plugin:awesome-onboarding',
  INVITATIONS: 'devprotocol:clubs:plugin:invitations',
  ACHIEVEMENTS: 'devprotocol:clubs:plugin:achievements',
}

const PLUGINS = Object.values(ID)

const getOptions = (plugins) => (id) =>
  plugins.find(({ id: _id }) => id === _id)?.options || []

const app = () => {
  upgrade((config) => {
    const upgradedConfig = { ...config }

    /**
     * Write upgrading script here
     */

    const options = getOptions(upgradedConfig.plugins)
    upgradedConfig.plugins = [
      ...upgradedConfig.plugins.filter(({ id }) =>
        PLUGINS.every((x) => x !== id),
      ),
      { id: ID.CLUBSPAYMENTS, options: options(ID.CLUBSPAYMENTS) },
      { id: ID.AWESOME_ONBOARDING, options: options(ID.AWESOME_ONBOARDING) },
      { id: ID.INVITATIONS, options: options(ID.INVITATIONS) },
      { id: ID.ACHIEVEMENTS, options: options(ID.ACHIEVEMENTS) },
    ]

    return upgradedConfig
  }, KEY)
}

app()
