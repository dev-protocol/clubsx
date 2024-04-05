import dotenv from 'dotenv'
import { bytes32Hex, decode, encode } from '@devprotocol/clubs-core'
import { isAddress } from 'ethers'
import { createClient } from 'redis'

dotenv.config()

const PROPERTY_ADDRESS = '0xF1AA1fC5a248bDCF531E45447916d49d54212AdE'
const PAYLOAD_OR_CONTRACT =
  '0x396997483c76a2c9a30d9800f563c27dc0faeb0c69195989c866806bde5637bd'
const BENEFIT_ID = 'one-time-cafe-access'
const DATE = new Date('2024-04-05T10:00:00+09:00')
const TOKEN_ID = 414

const app = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })
  await client.connect()

  const key = `devprotocol:clubs:plugin:tickets:history:${PROPERTY_ADDRESS}:${isAddress(PAYLOAD_OR_CONTRACT) ? `addr:${PAYLOAD_OR_CONTRACT}` : bytes32Hex(PAYLOAD_OR_CONTRACT)}#${TOKEN_ID}`
  const existingData = await client.get(key)

  /** @type Record<string, {datetime: Date}> */
  const histories = existingData ? decode(existingData) : {}
  const nextHistory = {
    ...histories,
    [BENEFIT_ID]: {
      datetime: DATE,
    },
  }

  await client.set(key, encode(nextHistory))
  await client.quit()
  console.log('Set', nextHistory)
}

app()
