export type Product = Readonly<{
  id: string
  name: string
  price: number
  description?: string
  left: string
  payload: string
  imageAlt: string
}>

export type Products = ReadonlyArray<Product>

export const products: Products = [
  {
    id: '1',
    name: 'Name',
    price: 0.3,
    description:
      'Get the full lineup of our Basic Tees. Have a fresh shirt all week, and an extra for laundry day.',
    left: '32',
    payload:
      'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link/',
    imageAlt:
      'Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.',
  },
  {
    id: '2',
    name: 'Name',
    price: 0.3,
    left: '32',
    payload:
      'https://bafybeic3d2otapykfdp3ktqbdonn4ylrove5ccs5vv2udydwbgudstrcwu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: '3',
    name: 'Name',
    price: 0.3,
    left: '32',
    payload:
      'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: '4',
    name: 'Name',
    price: 0.3,
    left: '32',
    payload:
      'https://bafybeiav46h6zegh4e7zfdcgk6xjpg6if2kdxtvp3ejtyicvpgc2iucpim.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: '5',
    name: 'Name',
    price: 0.3,
    left: '32',
    payload:
      'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link/',
    imageAlt:
      'Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.',
  },
  {
    id: '6',
    name: 'Name',
    price: 0.3,
    left: '32',
    payload:
      'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },

  // More products...
]
