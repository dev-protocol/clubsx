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
    address: '0x60d1743fc6791aEDB833E4aED604eccb9EC838DE',
  },
  {
    chainId: 80001,
    address: '0x5f9d9f40f4d7d8A350745D69e94E20339Df17b83',
  },
]

export const defaultAddress: Address = {
  chainId: 137,
  address: '0x60d1743fc6791aEDB833E4aED604eccb9EC838DE',
}

export const withdrawContractAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_from', type: 'address' },
      { internalType: 'address', name: '_to', type: 'address' },
    ],
    name: 'beforeBalanceChange',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_property', type: 'address' },
      { internalType: 'address', name: '_user', type: 'address' },
    ],
    name: 'calculateRewardAmount',
    outputs: [
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_price', type: 'uint256' },
      { internalType: 'uint256', name: '_cap', type: 'uint256' },
      { internalType: 'uint256', name: '_allReward', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'cumulativeWithdrawnReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_registry', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'lastWithdrawnRewardCapPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'lastWithdrawnRewardPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'pendingWithdrawal',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registryAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_property', type: 'address' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
