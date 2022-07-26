/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/
const products = [
  {
    id: 1,
    name: 'Name',
    href: '#',
    price: '0.3',
    description:
      'Get the full lineup of our Basic Tees. Have a fresh shirt all week, and an extra for laundry day.',
    left: '32',
    imageSrc:
      'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link/',
    imageAlt:
      'Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.',
  },
  {
    id: 2,
    name: 'Name',
    href: '#',
    price: '0.3',
    left: '32',
    imageSrc:
      'https://bafybeic3d2otapykfdp3ktqbdonn4ylrove5ccs5vv2udydwbgudstrcwu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: 3,
    name: 'Name',
    href: '#',
    price: '0.3',
    left: '32',
    imageSrc:
      'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: 4,
    name: 'Name',
    href: '#',
    price: '0.3',
    left: '32',
    imageSrc:
      'https://bafybeiav46h6zegh4e7zfdcgk6xjpg6if2kdxtvp3ejtyicvpgc2iucpim.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: 5,
    name: 'Name',
    href: '#',
    price: '0.3',
    left: '32',
    imageSrc:
      'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link/',
    imageAlt:
      'Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.',
  },
  {
    id: 6,
    name: 'Name',
    href: '#',
    price: '0.3',
    left: '32',
    imageSrc:
      'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },

  // More products...
]

export default function Cards() {
  return (
    <div className="bg-black">
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-[32px] border border-gray-500 bg-white"
            >
              <div className="aspect-w-3 aspect-h-4 sm:aspect-none bg-gray-200 group-hover:opacity-75 sm:h-96">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                />
              </div>
              <div className="flex flex-1 flex-col space-y-2 p-4">
                <h3 className="font-Syne mt-[32px] text-4xl font-normal text-gray-900">
                  <a href={product.href}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <div className="flex flex-1 flex-col justify-end">
                  <p className="font-Syne mt-[10px] text-sm font-normal text-black">
                    Price
                  </p>
                  <p className="font-DMSans text-2xl font-normal text-[#000000]">
                    Ξ{product.price}
                  </p>
                  <p className="font-Syne mt-[10px] text-lg font-normal text-[#88AEFF]">
                    {product.left} left
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
