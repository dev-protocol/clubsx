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
    address: '0xad7CaC908DfF8Dcd1D0d8d0FE3edD25bf339EB57',
  },
  {
    chainId: 80001,
    address: '0x927B51D9Edd43BFDE3586E99BfaCBE08135374AA',
  },
]

export const defaultAddress: Address = {
  chainId: 137,
  address: '0xad7CaC908DfF8Dcd1D0d8d0FE3edD25bf339EB57',
}

export const swapAndStakeAddressAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'payee',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
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
        name: 'payee',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CALL_MINTFOR_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'devAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'gatewayFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'gatewayOf',
    outputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'input', type: 'uint256' },
      { internalType: 'uint256', name: 'fee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'path', type: 'bytes' },
      { internalType: 'uint256', name: 'tokenAmount', type: 'uint256' },
    ],
    name: 'getEstimatedDevForTokens',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'path', type: 'bytes' },
      { internalType: 'uint256', name: 'devAmount', type: 'uint256' },
    ],
    name: 'getEstimatedTokensForDev',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_role', type: 'bytes32' },
      { internalType: 'address', name: '_account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_role', type: 'bytes32' },
      { internalType: 'address', name: '_account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_devAddress', type: 'address' },
      { internalType: 'address', name: '_lockupAddress', type: 'address' },
      { internalType: 'address', name: '_sTokensAddress', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lockupAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'address', name: '_property', type: 'address' },
      { internalType: 'bytes32', name: '_payload', type: 'bytes32' },
      { internalType: 'address', name: '_gatewayAddress', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'input', type: 'uint256' },
          { internalType: 'uint256', name: 'fee', type: 'uint256' },
        ],
        internalType: 'struct SwapTokensAndStakeDev.Amounts',
        name: '_amounts',
        type: 'tuple',
      },
    ],
    name: 'mintFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'quoter',
    outputs: [{ internalType: 'contract IQuoter', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_role', type: 'bytes32' },
      { internalType: 'address', name: '_account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sTokensAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'bytes', name: '_path', type: 'bytes' },
      { internalType: 'address', name: '_property', type: 'address' },
      { internalType: 'uint256', name: '_amountOut', type: 'uint256' },
      { internalType: 'uint256', name: '_deadline', type: 'uint256' },
      { internalType: 'bytes32', name: '_payload', type: 'bytes32' },
      {
        internalType: 'address payable',
        name: '_gatewayAddress',
        type: 'address',
      },
      { internalType: 'uint256', name: '_gatewayFee', type: 'uint256' },
    ],
    name: 'swapTokensAndStakeDev',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'contract IERC20', name: '_token', type: 'address' },
      { internalType: 'bytes', name: '_path', type: 'bytes' },
      { internalType: 'address', name: '_property', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_amountOut', type: 'uint256' },
      { internalType: 'uint256', name: '_deadline', type: 'uint256' },
      { internalType: 'bytes32', name: '_payload', type: 'bytes32' },
      {
        internalType: 'address payable',
        name: '_gatewayAddress',
        type: 'address',
      },
      { internalType: 'uint256', name: '_gatewayFee', type: 'uint256' },
    ],
    name: 'swapTokensAndStakeDev',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'bytes', name: '_path', type: 'bytes' },
      { internalType: 'address', name: '_property', type: 'address' },
      { internalType: 'uint256', name: '_amountOut', type: 'uint256' },
      { internalType: 'uint256', name: '_deadline', type: 'uint256' },
      { internalType: 'bytes32', name: '_payload', type: 'bytes32' },
    ],
    name: 'swapTokensAndStakeDev',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'contract IERC20', name: '_token', type: 'address' },
      { internalType: 'bytes', name: '_path', type: 'bytes' },
      { internalType: 'address', name: '_property', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_amountOut', type: 'uint256' },
      { internalType: 'uint256', name: '_deadline', type: 'uint256' },
      { internalType: 'bytes32', name: '_payload', type: 'bytes32' },
    ],
    name: 'swapTokensAndStakeDev',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'uniswapRouter',
    outputs: [
      { internalType: 'contract ISwapRouter', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_proxyAdmin', type: 'address' }],
    name: 'updateOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
