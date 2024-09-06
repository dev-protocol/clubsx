import { nanoid } from 'nanoid'

const PROXY_ADMIN = '0x02021C49DdBdf5349dFc42bE4D4a8e01Bc476342'
const MINTER_UPDATER = '0x7d41cE3E13082935b27b2CD110F8371638DcA555'
const MINTERS = ['0x05D5DD955bde5Cc09A70a611F49318A66A9C6e06']

const genName = (siteName: string) => `${siteName} Achievements - ${nanoid(4)}`
const genSymbol = (siteName: string) => siteName.toUpperCase().slice(0, 4)
