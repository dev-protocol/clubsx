import type { ErrorOr } from '@devprotocol/util-ts'
import { Contract, type ContractRunner } from 'ethers'
import { decode } from 'js-base64'
import { tryCatch } from 'ramda'

export type MetadataAttribute = {
  trait_type: string
  value: string
  display_type?: string
}

export type Metadata = {
  image: string
  name: string
  description: string
  attributes: MetadataAttribute[]
}

export const ABI_NFT = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256 balance)',
  'function ownerOf(uint256 tokenId) external view returns (address owner)',
]

const metadata = (str: string): ErrorOr<Metadata> =>
  tryCatch(
    (content: string) =>
      JSON.parse(
        content.startsWith('data:application/json;base64')
          ? decode(content.replace(/^data:application\/json;base64,(.*)/, '$1'))
          : content,
      ),
    (err: Error) => err,
  )(str)

export const getMetadata = async (
  contract: string,
  tokenId: string | number,
  provider: ContractRunner,
): Promise<ErrorOr<Metadata>> => {
  const sbt = new Contract(contract, ABI_NFT, provider)
  const tokenURI = await sbt.tokenURI(tokenId)
  return metadata(tokenURI)
}

export const getAllOwnedTokens = async (
  contract: string,
  owner: string,
  provider: ContractRunner,
): Promise<{ contract: string; id: number; metadata: ErrorOr<Metadata> }[]> => {
  const sbt = new Contract(contract, ABI_NFT, provider)
  const balance: bigint = await sbt.balanceOf(owner)
  const tokenIds: bigint[] = await Promise.all(
    Array.from({ length: Number(balance) }, (_, i) =>
      sbt.tokenOfOwnerByIndex(owner, i),
    ),
  )
  console.log({ tokenIds })
  const tokens = await Promise.all(
    tokenIds.map(async (id) => {
      const tokenURI = await sbt.tokenURI(id)
      const meta = metadata(tokenURI)
      return { id: Number(id), contract, metadata: meta }
    }),
  )
  return tokens
}
