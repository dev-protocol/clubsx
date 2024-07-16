import dotenv from 'dotenv'
import { upgrade } from './lib.upgrade.mjs'

dotenv.config()

const KEY = 'xxx'

const app = () => {
  upgrade((config) => {
    const upgradedConfig = { ...config }

    /**
     * Write upgrading script here
     */

    return upgradedConfig
  }, KEY)
}

app()
