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

### hotfix

If a bug in the stable release version is fixed in the pre-release version, you may want to apply it to the stable release version immediately.

In such cases, you can `checkout` the stable release version of the git tag, `cherry-pick` specific fix commit(s), and publish the new tag as the new stable release version. This is called a hotfix.

```bash
git checkout refs/tags/<LATEST_PRODUCTION_TAG_NAME> # ig, refs/tags/0.1.0
git cherry-pick <COMMIT_SHA1> # ig, 721f2af8ffae1a012317f25521cdaa934a023f4b
git tag <NEW_TAG_NAME> # ig, 0.1.0-hotfix.1
git push --tags # Push only the tag
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
