const KEY = 'pizza'
const MEMBERSHIP_PAYLOAD = new Uint8Array([
  47, 255, 181, 254, 85, 225, 124, 168,
])
const RECIPIENT = '0x95655AAe7F5079ac99d640F5b3633156b41E7108'
const SIGNATURE =
  '0x79d3d8f3a524712e160a409b666c41f724cab196441a60e44abe6e8ed36c676f1bb6b69a85dbcd005274894e3488ae496d604745ac80a0e9f99086fe893826f91b'
const MESSAGE = `Create a new invitation`

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
          recipients: [RECIPIENT],
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
