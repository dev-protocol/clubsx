import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode } from '@devprotocol/clubs-core'
import { isAddress } from 'ethers'

dotenv.config()

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    // Run only when the key structure is changed
    // // Remove all existing clubs documents first
    // for await (const key of client.scanIterator({
    //   MATCH: 'doc::clubs:clubs::*',
    //   COUNT: 100,
    // })) {
    //   if (key.startsWith('doc::clubs:clubs::')) {
    //     await client.del(key)
    //     console.log('Remove:', key)
    //   } else {
    //     console.log('Skip', key)
    //     continue
    //   }
    // }

    let allClubs = []

    // Fetch all clubs by existing enumrable key-value pairs
    for await (const key of client.scanIterator({
      MATCH: 'id::*',
      COUNT: 100,
    })) {
      if (key.startsWith('id::')) {
        const raw = await client.get(key)
        const value = JSON.parse(raw) // Array<{ name: string, created: string }>
        const id = key.replace('id::', '')
        const valueWithId = value.map((v) => ({ ...v, id }))
        allClubs = [...allClubs, ...valueWithId]
        console.log('Get:', key)
      } else {
        console.log('Skip', key)
        continue
      }
    }

    console.log({ allClubs })

    for await (const key of client.scanIterator()) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        console.log('Skip', key)
        continue
      }

      const encodedConfig = await client.get(key)
      const decodedConfig = decode(encodedConfig)
      const existingData = allClubs.filter((club) => club.name === key)
      const owner = existingData
        ? {
            address: existingData.find((x) => isAddress(x.id))?.id,
            uid: existingData.find((x) => !isAddress(x.id))?.id,
          }
        : undefined
      const firstRecord = existingData
        .sort((a, b) => (new Date(a.created) > new Date(b.created) ? 0 : -1))
        .at(0)
      const value = {
        id: key,
        propertyAddress: decodedConfig.propertyAddress,
        owner,
        created_at: firstRecord ? new Date(firstRecord.created).getTime() : 0,
      }
      console.log(key, value)
      await client.json.set(`doc::clubs:clubs::${key}`, '$', value)

      console.log('Set:', key)
    }

    console.log('DB Upgraded')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
