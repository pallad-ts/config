---
sidebar_position: 18
---

# Providers presets

Providers presets are helpers that bundles few providers into one for easier usage.

## Env + Envfile + SSM {#env-ssm}

Currently, the only available preset. Attempts to take value from environment variables, env file variables and in the
end from SSM.

### Installation

```bash npm2yarn
npm install @pallad/config-preset-env-ssm
```

### Usage

```typescript
import {createPreset} from '@pallad/config-preset-env-ssm';
import {secret} from '@pallad/secret';

const param = createPreset({
    // defines configuration for envFile provider, if not provided then envfile will be ignored
    envFile: { 
        paths: ['.env'],
    },
    // defines configuration for SSM, if not provided then ssm will be ignored
    ssm: {
        prefix: '/env/prod'
    }
});
```

General usage
```ts
param({env: 'DATABASE_PASSWORD', ssm: 'database/password'}, {transform: secret});
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


## Creating custom preset {#custom-preset}

Custom preset is a great way to simplify creation of config for you needs. 
Thanks for availability of [composition providers](./providers/composition) you can quickly implement even advanced scenarios.

There is no need to create some advanced setup for preset. You just need a function.
For example purposes let's create a preset that loads data from env files (based on environment) and automatically converts provided string to ssm key.

For example by calling 
```
param('database.hostname')
```
it loads data from `DATABASE_HOSTNAME` env variables and from SSM `/env/{environment}/database/hostname` for production.

```ts
import {env, isProduction} from '@pallad/app-env';
import {envFileProviderFactory} from '@pallad/config-envfile';
import {ssmProviderFactory} from '@pallad/config-envfile';
import {FirstAvailableProvider, Provider, wrapWithDefaultAndTransformer} from '@pallad/config';


function createPreset() {
    // setup provider factory for envFile data
    const envFile = envFileProviderFactory({
        paths: [
            `./config/${env}.env` // this file is required
        ],
    });

    // setup provider factory for SSM data but for production only
    const ssm = isProduction ? ssmProviderFactory({
        prefix: '/env/${env}/'
    }) : undefined;

    // returns a function that allows to wrap returned provider with transform and default values
    return wrapWithDefaultAndTransformer.wrap((key: string) => {
        // convert 'database.hostname' to 'DATABASE_HOSTNAME'
        const envKey = key.toUpperCase().replace(/\.+/g, '_');
        const providers: Provider<any>[] = [
            envFile(envKey)
        ];
        
        // only in production (otherwise ssm is not available)
        if (ssm) {
            // convert 'database.hostname' to 'database/hostname'
            const ssmKey = key.replace(/\.+/g, '/');
            providers.push(ssm(ssmKey));
        }
        
        return new FirstAvailableProvider(...providers);
    });
}
```

Example usage
```ts
import {secret} from '@pallad/secret';

export function createConfig() {
    const param = createPreset();
    
    return {
        database: {
            hostname: param('database.hostname'),
            password: param('database.password').secret(),
            username: param('database.username').secret(),
        }
    } 
}
```
So elegant!
