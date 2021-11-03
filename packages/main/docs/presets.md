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
