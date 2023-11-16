export const overrides = [
  {
    // 賛助会員 普通
    id: '----',
    importFrom: 'devprotocol:clubs:simple-memberships',
    key: 'memberships',
    payload:
      '0x007408bcd687ed9e07f48c0656773384c996f8e4ada7576a3c81d3d147166bb2',
    price: {
      yen: 3_000,
    },
  },
  {
    // 賛助会員 法人
    id: '--------',
    importFrom: 'devprotocol:clubs:simple-memberships',
    key: 'memberships',
    payload:
      '0xa0b3487e4bf288af6f386ce9dc2bf0ac7adbd6114d415b34a045c1206b57d267',
    price: {
      yen: 10_000,
    },
  },
  {
    // 特別栽培米 小口
    id: '----------------3',
    importFrom: 'devprotocol:clubs:simple-memberships',
    key: 'memberships',
    payload:
      '0x779bccd239a972ce7837227e7c087c4ef6021f16fd0bbc909f328024a64fcd50',
    price: {
      yen: 10_000 * 1.1,
    },
  },
  {
    // 特別栽培米 標準
    id: '---------------',
    importFrom: 'devprotocol:clubs:simple-memberships',
    key: 'memberships',
    payload:
      '0x53fc50b3d0edf574480c9cd48e1c8493e04593e3a2e9c66f773562dfd8371967',
    price: {
      yen: 35_000 * 1.1,
    },
  },
  {
    // 農薬不使用米 小口
    id: '--------------',
    importFrom: 'devprotocol:clubs:simple-memberships',
    key: 'memberships',
    payload:
      '0xb8e9750d7406859c235c5c5a511fd24577ead49a123e0d62a6dc47f9e9489014',
    price: {
      yen: 10_000 * 1.1,
    },
  },
  {
    // 農薬不使用米 標準
    id: '-------------',
    importFrom: 'devprotocol:clubs:simple-memberships',
    key: 'memberships',
    payload:
      '0x549145c48b05874e36ee3e4aeb7861cc214d23865c43f0c71e4efa909ee57208',
    price: {
      yen: 35_000 * 1.1,
    },
  },
]
