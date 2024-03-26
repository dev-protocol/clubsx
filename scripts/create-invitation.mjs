const KEY = 'pizza'
const MEMBERSHIP_PAYLOAD = new Uint8Array([
  47, 255, 181, 254, 85, 225, 124, 168,
])
const RECIPIENT = ''
const SIGNATURE = ''
const MESSAGE = `Create a new invitation for ${KEY} @ts:${new Date().getTime()}`

const main = async () => {
  const res = await fetch(
    `http://localhost:3000/sites_/pizza/api/devprotocol:clubs:plugin:invitations/invitations`,
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
