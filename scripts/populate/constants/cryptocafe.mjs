import fs from 'fs-extra'
import { toBytes32 } from '../utils/toBytes32.mjs'

export const cryptocafeAccessControl$1 = {
  url: 'https://clubs-userland-cryptocafe.vercel.app/api/access-control/airtable/tblJQKBASg0lawpk3/fldW3gZ4LhCXGg5nf',
  description: fs.readFileSync(
    './src/assets/accessControl.cryptocafe.description$1.md',
    'utf-8',
  ),
}
export const cryptocafeAccessControl$2 = {
  url: encodeURI(
    'https://clubs-userland-cryptocafe.vercel.app/api/access-control/airtable/tbliLoymN2sNRSDkQ/flddMiDmClyRnxwhb?additional-conditions=["fldmOuSsUw8CG34sd","送信"]',
  ),
  description: fs.readFileSync(
    './src/assets/accessControl.cryptocafe.description$2.md',
    'utf-8',
  ),
}

export const cryptoCafeMemberships = [
  {
    id: 'cafe-visitor',
    name: 'Cafe Visitor',
    description: `Get one-time access to our cafe (Any weekday.)\n\nWi-Fi, coffee\n\n---\n\n月〜金のカフェタイム利用\n\nWi-Fi、コーヒー飲み放題`,
    price: 16,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/4Qc8iDc.png',
    payload: toBytes32('cafe-visitor'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x76119972c0C0F3183378423DCa039e55D9824050',
    },
    accessControl: cryptocafeAccessControl$1,
  },
  {
    id: 'bar-visitor',
    name: 'Bar Visitor',
    description: `One-time access to our bar (Tuesday or Friday.)\n\nWi-Fi, complimentary drink\n\n---\n\n火・金のバータイム利用\n\nWi-Fi、コーヒー飲み放題、ドリンク1杯無料`,
    price: 16,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/PaxWOh8.png',
    payload: toBytes32('bar-visitor'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x76119972c0C0F3183378423DCa039e55D9824050',
    },
    accessControl: cryptocafeAccessControl$1,
  },
  {
    id: 'one-day',
    name: 'One Day',
    description: `A full day access to our cafe & bar (Tuesday or Friday)\n\nWi-Fi, coffee, complimentary drink\n\n---\n\n火・金のみ利用可能な1日券\n\nWi-Fi、コーヒー飲み放題、ドリンク1杯無料`,
    price: 24,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/0IJMz2K.png',
    payload: toBytes32('one-day'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x76119972c0C0F3183378423DCa039e55D9824050',
    },
    accessControl: cryptocafeAccessControl$1,
  },
  {
    id: 'friend-pass',
    name: 'Friend Pass',
    description: `Enjoy a month of unlimited cafe and bar visits for you and a friend.\n\nWi-Fi, coffee, complimentary drink, 1 free guest, special event\n\n---\n\n1ヶ月間の1日利用（バーは火・金）\n\nWi-Fi、コーヒー飲み放題、ゲスト1人無料、ドリンク1杯無料、スペシャルイベント招待`,
    price: 370,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/KzMhSgw.png',
    payload: toBytes32('friend-pass'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x76119972c0C0F3183378423DCa039e55D9824050',
    },
    accessControl: cryptocafeAccessControl$2,
  },
  {
    id: 'best-friend-pass',
    name: 'Best Friend Pass',
    description: `Enjoy three month of unlimited cafe and bar visits for you and a friend.\n\nWi-Fi, coffee, a complimentary drink,1 bottle corkage free,1 free guest, gifts, special event\n\n---\n\n3ヶ月間のフリーパス（バーは火・金）\n\nWi-Fi、コーヒー飲み放題、ゲスト1人無料、特別ギフト、ドリンク1杯無料、持ち込み1本無料、スペシャルイベント招待`,
    price: 905,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/v43yiqe.png',
    payload: toBytes32('best-friend-pass'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x76119972c0C0F3183378423DCa039e55D9824050',
    },
    accessControl: cryptocafeAccessControl$2,
  },
]
