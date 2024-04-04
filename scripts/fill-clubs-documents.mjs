import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode } from '@devprotocol/clubs-core'
import { Contract, isAddress, JsonRpcProvider, ZeroAddress } from 'ethers'
import { whenDefined } from '@devprotocol/util-ts'
import { scanOnlyClubs } from './lib.scanOnlyClubs.mjs'
import { always, tryCatch } from 'ramda'

dotenv.config()

const author = async (propertyAddress, rpcUrl) => {
  return tryCatch(
    (addr, rpc) =>
      new Contract(
        addr,
        ['function author() view returns(string)'],
        new JsonRpcProvider(rpc),
      ).author(),
    always(undefined),
  )(propertyAddress, rpcUrl)
}

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
    //   COUNT: 1000,
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
      COUNT: 1000,
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

    for await (const key of scanOnlyClubs(client)) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        console.log('Skip', key)
        continue
      }

      const encodedConfig = await client.get(key)
      const decodedConfig = decode(encodedConfig)
      const existingData = allClubs.filter((club) => club.name === key)
      const ownerAddress = await (async (club) => {
        const fromRedis = whenDefined(club, (c) => c.id)
        const fromOnChain = !fromRedis
          ? decodedConfig.propertyAddress &&
            decodedConfig.propertyAddress !== ZeroAddress
            ? await author(
                decodedConfig.propertyAddress,
                decodedConfig.rpcUrl,
              ).catch(always(undefined))
            : undefined
          : undefined
        return fromRedis || fromOnChain
      })(existingData.find((x) => isAddress(x.id)))
      const owner = existingData
        ? {
            address: ownerAddress,
            firebaseUid: existingData.find((x) => !isAddress(x.id))?.id,
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
