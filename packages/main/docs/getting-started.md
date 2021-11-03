---
sidebar_position: 5
---

# 3 minutes guide

This quick guide will show you how to setup basic configuration for database, load it from the app and display from CLI.

## Installation

```bash npm2yarn
npm install @pallad/config @pallad/config-cli
```

It is worth to install `@pallad/secret` to protect sensitive data (like passwords, jwt keys etc.) from accidental leak.

```bash npm2yarn
npm install @pallad/secret
```

## Create config file

Config file should define a function that creates an object with your entire configuration. You can define static values
that will never change or [providers](./providers) that are responsible for retrieving values from other sources like
env, env files or ssm.

````mdx-code-block
<Tabs>
<TabItem value="ts" label="Typescript">

```ts title="/src/config.ts"
import {env} from '@pallad/config';
import {secret} from '@pallad/secret';

export function createConfig() {
    return {
        database: {
            hostname: env('DATABASE_HOSTNAME'),
            port: 5432,
            username: env('DATABASE_USERNAME', {transformer: secret}),
            password: env('DATABASE_PASSWORD', {transformer: secret})
        }
    };
}
```

</TabItem>
<TabItem value="js" label="Javascript">

```js title="/src/config.js"
const {env} = require('@pallad/config')
const {secret} = require('@pallad/secret');

exports.createConfig = () => {
    return {
        database: {
            hostname: env('DATABASE_HOSTNAME'),
            port: 5432,
            username: env('DATABASE_USERNAME', {transformer: secret}),
            password: env('DATABASE_PASSWORD', {transformer: secret})
        }
    };
}
```

</TabItem>
</Tabs>
````

## Loading

Once shape of your configuration shape is defined you can load the final object.

:::caution

If your app uses asynchronous providers then you need to use `loadAsync` instead but it's not that simple.
See [usage section](./usage#loading-configuration) for more information.

:::

````mdx-code-block
<Tabs>
<TabItem value="ts" label="Typescript">

```ts title="/src/app.ts"
import {createConfig} from './config';

const config = loadSync(createConfig())
// your config is available
// if something went wrong then `loadSync` would have thrown an error
```

</TabItem>
<TabItem value="js" label="Javascript">

```js title="/src/app.js"
const {loadSync} = require('@pallad/config')
const {createConfig} = require('./config');

const config = loadSync(createConfig())
// your config is available
// if something went wrong then `loadSync` would have thrown an error

```

</TabItem>
</Tabs>
````

## Display config in CLI

Provide information for `@pallad/config-cli` about location of your configuration function. Edit `package.json` and add
following code

```json
{
    "pallad-config": {
        "file": "src/config.js"
    }
}
```

Now run

```bash
pallad-config
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
pallad-config
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
pallad-config --revealSecrets
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
            username: env('DATABASE_USERNAME', {transformer: secret}),
            password: env('DATABASE_PASSWORD', {transformer: secret})
        }
    };
}

export type Config = ResolvedConfig<ReturnType<typeof createConfig>>;
```

Then you can use it later in the app

```ts
function connectToDatabase(config: Config['database']) {
    config.hostname // typescript likes 👍
    config.unknownProperty // typescript not like 👎
}
```
