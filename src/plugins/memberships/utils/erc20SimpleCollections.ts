import type { BaseProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import type {
  TransactionResponse,
  TransactionReceipt,
  BrowserProvider,
  Signer,
  Provider,
} from 'ethers'
type Address = {
  chainId: number
  address: string
}
export const address: Address[] = [
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 4,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 42161,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 421611,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 137,
    address: '0xeda487e4cd25098e78fe2f87ae1705787500b492',
  },
  {
    chainId: 80001,
    address: '0x2cB27C2827b1812B8C817fCcA2fdb6C545465A46',
  },
]

const defaultAddress: Address = {
  chainId: 137,
  address: '0xeda487e4cd25098e78fe2f87ae1705787500b492',
}

const erc20SimpleCollectionsAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'allowListToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'allowlistedTokens',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'denyListToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'property',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cumulativeReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'pendingReward',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISTokensManagerStruct.StakingPositions',
        name: '_positions',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'entireReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cumulativeReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'withdrawableReward',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISTokensManagerStruct.Rewards',
        name: '',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'description',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'property',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cumulativeReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'pendingReward',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISTokensManagerStruct.StakingPositions',
        name: '_positions',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'entireReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cumulativeReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'withdrawableReward',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISTokensManagerStruct.Rewards',
        name: '',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'image',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'property',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cumulativeReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'pendingReward',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISTokensManagerStruct.StakingPositions',
        name: '_positions',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'entireReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cumulativeReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'withdrawableReward',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISTokensManagerStruct.Rewards',
        name: '',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'property',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cumulativeReward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'pendingReward',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISTokensManagerStruct.StakingPositions',
        name: '_positions',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'onBeforeMint',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'propertyImages',
    outputs: [
      {
        internalType: 'string',
        name: 'src',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'requiredTokenAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'requiredTokenFee',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'gateway',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_propertyAddress',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_key',
        type: 'bytes32',
      },
    ],
    name: 'removeImage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_propertyAddress',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'src',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'requiredTokenAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'requiredTokenFee',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'gateway',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
        ],
        internalType: 'struct ERC20SimpleCollections.Image[]',
        name: '_images',
        type: 'tuple[]',
      },
      {
        internalType: 'bytes32[]',
        name: '_keys',
        type: 'bytes32[]',
      },
    ],
    name: 'setImages',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'setSwapAndStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'stakedAmountAtMinted',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'swapAndStake',
    outputs: [
      {
        internalType: 'contract IDynamicTokenSwapAndStake',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export type ERC20Image = {
  src: string
  name: string
  description: string
  requiredTokenAmount: string | bigint | BigNumber
  requiredTokenFee: string | bigint | BigNumber
  gateway: string
  token: string
}

export async function callERC20SimpleCollections(
  provider: Signer,
  functionName: 'setImages',
  args: [propertyAddress: string, images: ERC20Image[], keys: string[]],
): Promise<TransactionResponse>

export async function callERC20SimpleCollections(
  provider: Signer,
  functionName: 'removeImage',
  args: [propertyAddress: string, key: string],
): Promise<TransactionResponse>

export async function callERC20SimpleCollections(
  provider: BrowserProvider,
  functionName: 'propertyImages',
  args: [propertyAddress: string, key: string],
): Promise<ERC20Image>

export async function callERC20SimpleCollections(
  provider: BrowserProvider | Signer,
  functionName: string,
  args: unknown[],
): Promise<unknown> {
  const chainId = await ('getNetwork' in provider
    ? (provider as BrowserProvider).getNetwork()
    : ((provider as Signer).provider as Provider).getNetwork()
  ).then((network) => {
    return Number(network.chainId)
  })

  const erc20SimpleCollectionaddress =
    address.find((a) => a.chainId === chainId)?.address ||
    defaultAddress.address
  const contract = new ethers.Contract(
    erc20SimpleCollectionaddress,
    erc20SimpleCollectionsAbi,
    provider,
  )

  const result: TransactionReceipt = await contract[functionName](...args)
  return result
}
