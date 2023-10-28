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
REDIS_USERNAME=default
REDIS_PASSWORD=my-redis-password
REDIS_URL='redis://redis....com:16141'
```

## populate Redis with tenants

Once you have set the Redis env variables, you are ready to populate your database.
You can do this by running `yarn run populate`.

## copy clubs from the production

For debugging purposes, you can copy the production configuration to a locally connected Redis by running `yarn copy --club CLUB_TENANT_ID`.
