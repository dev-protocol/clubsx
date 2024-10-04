## development

Install Dependencies:

```bash
yarn install
```

Start the app:

```bash
yarn dev
```

## releases

Use `npm version` to manage git tags and update hosted Clubs by publishing them as GitHub Releases.

```bash
npm version [patch|minor|major]
git push && git push --tags
```

Semantic versioning can basically be determined by the following rules:

| command               | when                                               |
| --------------------- | -------------------------------------------------- |
| npm version **patch** | Bug fixes, Updates without changing functionality. |
| npm version **minor** | Updates without breaking changes.                  |
| npm version **major** | Major updates with breaking changes.               |

### pre-release

Changes to the `main` branch are always automatically deployed as prereleases.

## setup env file

example:

```
REDIS_USERNAME=default
REDIS_PASSWORD=my-redis-password
REDIS_URL='redis://redis....com:16141'
```

## populate Redis with tenants

Once you have set the Redis env variables, you are ready to populate your database.
You can do this by running `yarn run populate`.

## copy clubs from the production

For debugging purposes, you can copy the production configuration to a locally connected Redis by running `yarn copy --club CLUB_TENANT_ID`.
