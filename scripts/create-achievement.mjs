const KEY = 'test-mizu'
const SIGNATURE =
  '0x79d3d8f3a524712e160a409b666c41f724cab196441a60e44abe6e8ed36c676f1bb6b69a85dbcd005274894e3488ae496d604745ac80a0e9f99086fe893826f91b'
const MESSAGE = `Create a new invitation`

const main = async () => {
  const res = await fetch(
    `http://localhost:3000/sites_/${KEY}/api/devprotocol:clubs:plugin:achievements/achievements`,
    {
      method: 'POST',
      body: JSON.stringify({
        achievement: {
          contract: '0xAA821D4397B6253BF5d42a9e6B6AaE6B5C52723d',
          conditions: {
            recipients: [
              '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
              '0x3996D2AF9aa5bA6d38d569d5CD3894A201139e6D',
            ],
          },
          metadata: {
            name: 'Debug',
            description: 'debug',
            image: 'https://i.imgur.com/xqJLFEE.png',
            numberAttributes: [
              {
                trait_type: 'NUM1',
                display_type: 'number',
                value: 0,
              },
              {
                trait_type: 'NUM2',
                display_type: 'number',
                value: 1,
              },
            ],
            stringAttributes: [
              {
                trait_type: 'STR1',
                value: 'X',
              },
              {
                trait_type: 'STR2',
                value: 'Y',
              },
            ],
          },
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

  console.log(`response is: `, json)
}

main()

// FBBXIh-xOF
// V-Diagh_-G
