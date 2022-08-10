## development

Install Dependencies:

```bash
yarn install
```

Start the app:

```bash
yarn dev
```

## setup env file

example:

```
PUBLIC_WEB3_PROVIDER_URL=https://arb-mainnet.g.alchemy.com/v2/wAcoCy...xYA3HJ
```

### setup Quests data

edit to `src/components/Quests/quests.json` file.

List of Data with the following keys and values:

| key           | type      | description                                               |
| ------------- | --------- | --------------------------------------------------------- |
| id            | `string`  | `id` is treated as the URL key for the quest details page |
| title         | `string`  | -                                                         |
| description   | `string`  | -                                                         |
| badgeImageSrc | `string`  | -                                                         |
| listed        | `boolean` | If false, the quest is not visible on the Quests list     |

for example:

```
[
  {
    "id": "quest_starter",
    "title": "Become the first 30 supporters",
    "description": "start description description",
    "badgeImageSrc": "https://cdn.yourdomain.com/assets/badge1.png",
    "listed": true
  },
  {
    "id": "quest_stake_100",
    "title": "Stake more than 100",
    "description": "more than 100 description description",
    "badgeImageSrc": "/assets/badge2.png",
    "listed": false
  }
]
```

### setup tenants

Fill in the data in `src/constants/tenants.ts`.
Navigate to the subdomain set by id.
