const KEY = ''
const MEMBERSHIP_PAYLOAD = new Uint8Array([])
const RECIPIENT = ''
const SIGNATURE = ''
const MESSAGE = `Create a new invitation for ${KEY} @ts:${new Date().getTime()}`

const main = async () => {
  const res = await fetch(
    `https://${KEY}.clubs.place/api/devprotocol:clubs:plugin:invitations/invitations`,
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

  if (res.status !== 200) {
    throw new Error('Failed to create an invitation')
  }

  const json = await res.json()
  console.log(`Invitation created: ${json}`)
}

main()
