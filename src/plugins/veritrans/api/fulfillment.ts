import type { APIRoute } from 'astro'
import { AbiCoder } from 'ethers'

export const abi = [
  'address _mintFor',
  'address _propertyAddress',
  'bytes32 _payload',
  'address _paymentToken',
  'uint256 _paymentAmount',
  'address _feeBeneficiary',
  'uint256 _feePercentage',
]

/**
 * This endpoint is expected to be called with the following parameters:
 * ?params={ABI_ENCODED_PARAMS}
 */
export const post: ({
  webhookOnFulfillment,
}: {
  webhookOnFulfillment?: string
}) => APIRoute =
  ({ webhookOnFulfillment }) =>
  async ({ request, url }) => {
    /**
   * WE NEED TO CHECK THE CALLER IS THE VERITRANSE SERVER:
   * > POP Server adds a `signature` as the last parameter in both Transaction Status Through Redirection as well as Push Notifications. The `signature` is derived from the parameters and their values in the notification.
   * > The Merchant Server has to derive a signature using the same logic and compare with the `signature` received from POP Server. If both the signatures match then and only then should the Merchant Server process further.
   *
    ```
    // Step 1 - Read all the parameters and their values

    // Step 2a - Convert all string arrays into comma separated values
    valueX = valueX[0] + ","
            + valueX[1] + ","
            + valueX[i]

    ...  //Do this for all parameters that receive values in arrays

    // Step 2b - Sort all the parameters in alphabetical order,
    // skip the signature parameter

    // Step 3 - Construct an input string using <parameter name>=<value> format
    // and appending the POP_SERVER_KEY preceded by ':'.
    // Use "true" or "false" string as value for boolean parameter(s).
    inputString = ( name1=value1&name2=value2&...&nameN=valueN )
                  + ":" + POP_SERVER_KEY;

    // Step 4 - Derive the signature using SHA512 hash function
    signature = SHA512( inputString );

    // Step 5 - Compare the signature received in the notification
    // with the signature derived from the received parameters
    ```
   */

    const body = await request.json()
    console.log(1, body)

    const params = url.searchParams.get('params')

    console.log(2, params)

    if (!params) {
      return {
        status: 200, // Always 200
        body: JSON.stringify({ message: '`?params` is missing' }),
      }
    }

    const [
      mintFor,
      propertyAddress,
      payload,
      paymentToken,
      paymentAmount,
      feeBeneficiary,
      feePercentage,
    ] = AbiCoder.defaultAbiCoder().decode(abi, params)

    console.log(3, [
      mintFor,
      propertyAddress,
      payload,
      paymentToken,
      paymentAmount,
      feeBeneficiary,
      feePercentage,
    ])

    return {
      body: '',
    }
  }
