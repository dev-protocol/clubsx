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

### pre-release

If you are incrementing a pre-release version that already exists:

```bash
npm version prerelease
git push && git push --tags
```

To create a new pre-release version from an existing stable release version:

```bash
npm version preminor --preid beta
# Depending on the changes, [prepatch|premajor] can also be used
git push && git push --tags
```

### stable release

When turning a pre-release into a stable release or updating a stable release, do the following:

```bash
npm version [patch|minor|major]
git push && git push --tags
```

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
