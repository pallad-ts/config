---
sidebar_position: 5
---

# 3 minutes guide

This quick guide will show you how to setup basic configuration for database, load it from the app and display from CLI.

:::info

This guide uses commonjs javascript modules but you can use typescript or ecma script modules as well.

:::

## Installation

```bash npm2yarn
npm install @pallad/config @pallad/config-cli
```

## Create config file

Config file should define a function that creates an object with your entire configuration. You can define static values
that will never change or [providers](./providers) that are responsible for retrieving values from other sources like
env, env files or ssm.

```js title="/src/config.js"

const {env} = require('@pallad/config');

modules.exports = function createConfig() {
    return {
        database: {
            hostname: env('DATABASE_HOSTNAME'),
            port: 5432,
            username: env('DATABASE_USERNAME').secret(),
            password: env('DATABASE_PASSWORD').secret()
        }
    };
}
```

## Loading

Once shape of your configuration shape is defined you can load the final object.

:::caution

If your app uses asynchronous providers then you need to use `loadAsync` instead but it's not that simple.
See [usage section](./usage#loading-configuration) for more information.

:::


```js title="/src/app.js"
const {createConfig} = require('./config');

const config = loadSync(createConfig())
// your config is available
// in case of error `loadSync` throws an error
```

## Display config in CLI

Run CLI with location of a file that exports config (`-c`)

```bash
pallad-config -c ./src/config.js
```

You should see something like this

```shell
Object {
  "database": Object {
    "hostname": Value not available: ENV: DATABASE_HOSTNAME,
    "password": Value not available: ENV: DATABASE_PASSWORD,
    "port": 5432,
    "username": Value not available: ENV: DATABASE_USERNAME,
  },
}
```

As you see not all env variables are defined. Let's define them just for testing purposes.

```bash
DATABASE_USERNAME=my-username \
DATABASE_PASSWORD=superSecret123! \
DATABASE_HOSTNAME=localhost \
pallad-config -c ./src/config.js
```

```shell
Object {
  "database": Object {
    "hostname": "localhost",
    "password": **SECRET** (secret),
    "port": 5432,
    "username": **SECRET** (secret),
  },
}
```

Much better!

Secret values are not visible by default. In order to show them you need to add `--revealSecrets` flag.

```bash
DATABASE_USERNAME=my-username \
DATABASE_PASSWORD=superSecret123! \
DATABASE_HOSTNAME=localhost \
pallad-config -c ./src/config.js --revealSecrets
```

```shell
Object {
  "database": Object {
    "hostname": "localhost",
    "password": "superSecret123!" (secret),
    "port": 5432,
    "username": "my-username" (secret),
  },
}
```

## Extracting configuration type (optional)

:::note

This step applies to typescript codebase only.

:::

You can extract type from your configuration.

```ts title="/src/config.ts"
import {ResolvedConfig, env} from '@pallad/config';

export function createConfig() {
    return {
        database: {
            hostname: env('DATABASE_HOSTNAME'),
            port: 5432,
            username: env('DATABASE_USERNAME').secret(),
            password: env('DATABASE_PASSWORD').secret()
        }
    };
}

export type Config = ResolvedConfig<ReturnType<typeof createConfig>>;
```

Then use it later in the app
```ts
function connectToDatabase(config: Config['database']) {
    config.hostname // typescript likes 👍
    config.unknownProperty // typescript not like 👎
}
```
