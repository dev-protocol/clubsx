import { createClient } from 'redis'
import dotenv from 'dotenv'
import { nanoid } from 'nanoid'

dotenv.config()

const addId = (data) => ({
  ...data,
  id: data.id
    ? data.id
    : (() => {
        console.log('id will add to:', data)
        return nanoid()
      })(),
})

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    for await (const key of client.scanIterator({
      MATCH: 'profile::*',
      COUNT: 1000,
    })) {
      await client.get(key).then((raw) => {
        const data = JSON.parse(raw)
        if (Array.isArray(data.skins)) {
          data.skins = data.skins.map((skin) => ({
            ...skin,
            bgm: skin.bgm ? addId(skin.bgm) : skin.bgm,
            videos: skin.videos ? skin.videos.map(addId) : skin.videos,
            spotlight: skin.spotlight
              ? skin.spotlight.map(addId)
              : skin.spotlight,
            clips: skin.clips ? skin.clips.map(addId) : skin.clips,
          }))
          return client.set(key, JSON.stringify(data))
        }
        return Promise.resolve()
      })
    }

    console.log('DB Upgraded')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
