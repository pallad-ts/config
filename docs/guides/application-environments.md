---
sidebar_position: 1
---

# Application environments

One of the main goals of having configuration is to be able to easily change values in it for different environments.
For production would be nice to get secrets from SSM,
for local development envfiles are enough since secrets for local development don't need to be secure.

`@pallad/config` allows to achieve it in easy way. 
For that purpose let's use example [env+ssm](../presets#env-ssm) preset and [`@pallad/app-env`](https://github.com/pallad-ts/app-env) for detecting environment.

```ts
import {createPreset} from '@pallad/config-preset-env-ssm';
import {forProduction, env} from '@pallad/app-env';
import {secret} from '@pallad/secret';

export function createConfig() {
    const param = createPreset({
        envFile: {
            paths: [
                // common config
                {path: './config/common.env', required: false},
                // use config/production.env or config/ci.env if available
                {path: `./config/${env}.env`, required: false}
            ]
        },
        // enable SSM only for production
        ssm: forProduction({
            prefix: '/env/prod'
        })
    });

    return {
        database: {
            // since ssm is disabled for non-production environments
            // only env and envfiles will be taken into account
            // for production - SSM included as well
            hostname: param({env: 'DATABASE_HOSTNAME', ssmKey: 'database/hostname'}),
            port: 5432,
            username: env({env: 'DATABASE_USERNAME', ssmKey: 'database/username'}).secret(),
            password: env({env: 'DATABASE_PASSWORD', ssmKey: 'database/password'}).secret()
        }
    }
}
```

:::tip
There is no way to predict all possible usages for providers and presets so if currently [available solutions](../presets) 
are not enough for you then it is highly recommended to [create your own preset](../presets#custom-preset).
:::
