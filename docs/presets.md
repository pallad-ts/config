---
sidebar_position: 18
---

# Providers presets

Providers presets are helpers that bundles few providers into one for easier usage.

## Env + Envfile + SSM {#env-ssm}
Attempts to take value from environment variables, env file variables and in the end from AWS Parameter Store.

### Installation

```bash npm2yarn
npm install @pallad/config-preset-env-ssm
```

### Usage

```typescript
import {createPreset} from '@pallad/config-preset-env-ssm';

const param = createPreset({
    // defines configuration for envFile provider, if not provided then envfile will be ignored
    envFile: { 
        files: ['.env'],
    },
    // defines configuration for SSM, if not provided then ssm will be ignored
    ssm: {
        prefix: '/env/prod'
    }
});
```

General usage
```ts
param({env: 'DATABASE_PASSWORD', ssm: 'database/password'}).secret();
```

This fella attempts to load value from:
- env variable `DATABASE_PASSWORD`
- if that fails then try to load `DATABASE_PASSWORD` from envfiles
- if that fails then try to load `env/prod/database/password` from SSM

At the end wraps value with [secret](https://npmjs.com/package/@pallad/secret).

#### Other cases

Use only env variables and envfile. Ignore SSM.
```ts
param({env: 'DATABASE_PASSWORD'})
```

Use only SSM, ignore env and envfile.
```ts
param({ssm: 'database/password'})
```

## Env + Envfile + AWS Secret Manager {#env-secret-manager}
Attempts to take value from environment variables, env file variables and in the end from AWS Secret Manager.


### Installation

```bash npm2yarn
npm install @pallad/config-preset-env-aws-secret-manager
```

### Usage

```typescript
import {createPreset} from '@pallad/config-preset-env-aws-secret-manager';

const param = createPreset({
    // defines configuration for envFile provider, if not provided then envfile will be ignored
    envFile: { 
        files: ['.env'],
    },
    // defines configuration for AWS Secret Manager, if not provided then AWS Secret Manager will be ignored
    secretManager: {
        prefix: '/env/prod'
    }
});
```

General usage
```ts
param({env: 'DATABASE_PASSWORD', secretReference: {name: 'database', property: 'password'}}).secret();
```

This fella attempts to load value from:
- env variable `DATABASE_PASSWORD`
- if that fails then try to load `DATABASE_PASSWORD` from envfiles
- if that fails then try to load `env/prod/database` secret from AWS Secret Manager and extract property `password` from it

At the end wraps value with [secret](https://npmjs.com/package/@pallad/secret).

#### Other cases

Use only env variables and envfile. Ignore AWS Secret Manager.
```ts
param({env: 'DATABASE_PASSWORD'})
```

Use only AWS Secret manager, ignore env and envfile.
```ts
param({secretReference: {name: 'database', property: 'password'}});
```


## Custom preset

It is very easy to define your own preset. Let's use one from [advanced config](./guides/advanced-config) example that loads values from TOML files and AWS Secret Manager is value is not provided in TOML.

```ts
import { info } from "@pallad/app-env";
import { secretManagerProviderFactory } from "@pallad/config-aws-secret-manager";
import { tomlProviderFactory } from "@pallad/config-toml";
import { FirstAvailableProvider } from "@pallad/config";

export function createConfig() {
    
    const toml = tomlProviderFactory({
        files: [
            `./config/main.toml`,
            { path: `./config/${info.name}.toml`, required: false },
        ],
    });

    const secretManager = secretManagerProviderFactory({
        prefix: `/${info.name}/`,
    });
    
    // generator is a really nice way to define preset
    function* tomlAndSecretManagerGenerator(key: string) {
        // always read from toml (to allow override)
        yield toml(key);
    
        // take from secret manager (for production and staging only)
        if (info.is("production", "staging")) {
            yield secretManager({name: key});
        }
    }
    
    function tomlAndSecretManager(key: string) {
        return new FirstAvailableProvider(...tomlAndSecretManagerGenerator(key));
    }
    
    return {
        // loads property `example` from TOML files or `/[envName]/example` from AWS Secret Manager
        example: tomlAndSecretManager('example')
    }
}
```
