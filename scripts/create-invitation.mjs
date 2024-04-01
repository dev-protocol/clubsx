const KEY = ''
const MEMBERSHIP_PAYLOAD = new Uint8Array([])
const RECIPIENT = ''
const SIGNATURE = ''
const MESSAGE = `Create a new invitation for 23-12-12--posts-test`

const main = async () => {
  const res = await fetch(
    `http://localhost:3000/sites_/${KEY}/api/devprotocol:clubs:plugin:invitations/invitations`,
    {
      method: 'POST',
      body: JSON.stringify({
        membership: {
          payload: MEMBERSHIP_PAYLOAD.toString(),
        },
        conditions: {
          recipient: RECIPIENT,
        },
        signature: SIGNATURE,
        message: MESSAGE,
      }),
    },
  )

  const json = await res.json()

  if (res.status !== 200) {
    console.log('failed json is: ', json)
    throw new Error('Failed to create an invitation')
  }

  console.log(`new invitation id is: `, json.id)
}

main()

// FBBXIh-xOF
// V-Diagh_-G
