import { createClient } from 'redis'
import dotenv from 'dotenv'
import * as XLSX from 'xlsx/xlsx.mjs'
import * as fs from 'fs'
import { Readable } from 'stream'
import * as cpexcel from 'xlsx/dist/cpexcel.full.mjs'
import { decode } from '@devprotocol/clubs-core'

import { ethers } from 'ethers'

XLSX.set_fs(fs)
XLSX.stream.set_readable(Readable)

/* load the codepage support library for extended support with older formats  */
XLSX.set_cptable(cpexcel)

dotenv.config()

const ALCHEMY_CODE = ''

const app = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })
  await client.connect()

  const jsonList = await client.ft
    .search('idx::clubs:club', '*', {
      LIMIT: { from: 0, size: 10000 },
    })
    .then((res) => {
      return JSON.parse(JSON.stringify(res.documents))
    })

  console.log({ jsonList })

  // const fetchList = []

  const propertyABI = ['function author() view returns (address)']
  const provider = new ethers.JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_CODE}`,
  )

  let counter = 0
  const clubsVerifiedData = async (item) => {
    const id = item.value.id
    // console.log({counter,id})
    const firebaseId = item.value.owner?.firebaseUid
    const creationDate = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(item.value.created_at))
    const config = await client.get(id)
    const decoded = decode(config)
    const { name, url, propertyAddress, chainId } = decoded
    let owner = ''
    if (chainId === 137) {
      if (
        propertyAddress !== '0x0000000000000000000000000000000000000000' &&
        propertyAddress
      ) {
        // console.log("inside if",{counter, propertyAddress})
        const propertyContract = new ethers.Contract(
          propertyAddress,
          propertyABI,
          provider,
        )
        owner = await propertyContract.author().catch((e) => {
          console.log({ counter, propertyAddress, e })
          return ''
        })
      } else {
        owner = item.value.owner?.address
      }
      // console.log({id, name, url, propertyAddress, owner, firebaseId, creationDate})
      counter++
      // fetchList.push({ id, name, url, propertyAddress, author })
      return { id, name, url, propertyAddress, owner, firebaseId, creationDate }
    } else {
      return undefined
    }
  }
  // let count = 0
  // for (const item of jsonList) {
  //     await clubsVerifiedData(item.value.id).then(() => {
  //         count++
  //         console.log({count})
  //     })
  //     if (count === 10) {
  //         break
  //     }
  // }
  // console.log({fetchList})

  const formatedData = (
    await Promise.all(
      jsonList.map(
        async (item) => await clubsVerifiedData(item),
        //     {
        //     id: item.value.id,
        //     propertyAddress: item.value.propertyAddress,
        //     owner: item.value.owner?.address,
        //     firebase_id: item.value.owner?.firebaseUid,
        //     created_at: new Intl.DateTimeFormat('ja-JP', {
        //         timeZone: 'Asia/Tokyo',
        //         year: 'numeric',
        //         month: '2-digit',
        //         day: '2-digit',
        //         hour: '2-digit',
        //         minute: '2-digit',
        //         second: '2-digit'
        //     }).format(new Date(item.value.created_at))
        // }
      ),
    )
  ).filter((item) => item !== undefined)

  console.log({ formatedData })
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(formatedData)
  // const ws2 = XLSX.utils.json_to_sheet(fetchList);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  // XLSX.utils.book_append_sheet(wb, ws2, "Sheet2");
  XLSX.writeFile(wb, 'clubsUpdated.xlsx')
  console.log('done')
  await client.quit()
}
app()
