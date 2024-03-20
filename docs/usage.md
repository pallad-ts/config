---
sidebar_position: 10
---

# Usage

## Defining configuration

First step of using `@pallad/config` is defining a function that returns object describing configuration shape that we
can later use from application or CLI.

```ts
export function createConfig() {
    return {
        database: {
            hostname: 'localhost',
            password: 'superSecret123!',
            port: 5432,
            username: 'postgres'
        }
    };
}
```

Obviously configuration with static values only isn't that useful. For production you would rather like to use different
password, username and hostname. Moreover you wouldn't like to have such sensitive data like password stored in git
repository. Not only it is not secure (unless you're using [git secret](https://git-secret.io/)) but also much harder to
change. To make config more useful you need add some information how to obtain those values.

For this example let's assume that those values will be injected through env variables.

```ts
import {env} from '@pallad/config';

export function createConfig() {
    return {
        database: {
            hostname: env('DATABASE_HOSTNAME').defaultTo('localhost'),
            password: env('DATABASE_PASSWORD'),
            port: env('DATABASE_PORT').defaultTo(5432),
            username: env('DATABASE_USERNAME').defaultTo('postgres')
        }
    };
}
```

Much better. Now you can easily change them, without changing your code.

Env variables is not the only way to inject values into your configuration. See [providers section](./providers) to find more.

Now it is time to retrieve that configuration from app level.

## Loading configuration

Loading is a process of taking configuration shape and replacing providers with a value resolved by replaced provider.
If that fails, then whole loading process fails as well.

:::tip

Loading makes a copy of plain objects and arrays before replacing values.

Any objects that are *not* plain objects like instance of custom classes, maps, sets etc are ignored as just moved as it is.
That means if you have any providers inside of them, they'll not be resolved.

:::

If your configuration shape consist of synchronous providers only then you can load it using `loadSync`.

```ts
import {loadSync} from '@pallad/config';
import {createConfig} from './config';

const config = loadSync(createConfig());

// now your config is available

// start your app here
```

### Asynchronous loading

If at least one of your providers is or might be asynchronous then you need to use `loadAsync` instead.

`loadAsync` returns a promise so you need to wrap your app with async function.

```ts
import {loadAsync} from '@pallad/config';
(async () => {
    const config = await loadAsync(createConfig());
    // start your app here
})();
```
:::tip

Node.js supports top-level await so in there is no need to create async wrapper function. This is still experimental feature and available only if node is ran with  `--experimental-top-level-await` flag.

:::

