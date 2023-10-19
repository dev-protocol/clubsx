import { createClient } from 'redis'
import dotenv from 'dotenv'
import fetch from 'cross-fetch'

dotenv.config()

const KEY = ((i) => (i > -1 ? process.argv[i + 1] : undefined))(
  process.argv.findIndex((a) => a === '--club'),
)

console.log({ KEY })

/**
 * With running `yarn copy --club CLUB_TENANT_ID`, this script copies the ClubsConfiguration from the production environment.
 */
const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    const source = await fetch(`https://clubs.place/api/config/${KEY}`).then(
      (data) => data.json(),
    )
    console.log({ source })

    await client.set(KEY, source.content)
    console.log('Copied from production:', KEY)

    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
