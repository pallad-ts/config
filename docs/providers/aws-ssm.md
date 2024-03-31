---
sidebar_position: 15
---

# AWS SSM

[Asynchronous](./#introduction-to-providers) provider that loads data
from [AWS SSM Parameter store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
.

Parameter store is useful for storing secrets (like database passwords, jwt secret keys, api keys) in a secure way.

Provider loads parameters in batch (and decrypts them as well) through
[dataloader](https://www.npmjs.com/package/dataloader) which means you can easily define multiple parameters in the
config an almost all of them will be loaded in batch.

:::caution

In order to load SSM parameters you need to have sufficient permissions. We highly recommend narrowing down permissions
to give access to parameters that are required for you app, otherwise you're risking unauthorized access to other
secrets.

The example policy allows retrieving only parameters from prefix `"env/prod/"`.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ssm:GetParameters",
            "Resource": "arn:aws:ssm:*:*:parameter/env/prod/*"
        }
    ]
}
```

:::

# Installation

```bash npm2yarn
npm install @pallad/config-aws-ssm
```

The simplest example

```ts
import {ssmProviderFactory} from '@pallad/config-aws-ssm';
import {secret} from '@pallad/secret';

const ssm = ssmProviderFactory();

// retrieves "/env/prod/database/password" parameter
ssm('/env/prod/database/password');

// same as above but additionally wraps it with secret
ssm('/env/prod/database/password', {transform: secret});
```

:::info

While SSM provider is great by itself it might be more beneficial to use it with [preset](../presets#env-ssm).

:::

## Customization

### Prefix all parameter names

```ts
import {ssmProviderFactory} from '@pallad/config-aws-ssm';

const ssm = ssmProviderFactory({
    prefix: '/env/prod/'
});

// retrieves "/env/prod/database/password" parameter
ssm('database/password')
```

### Use custom instance of SSM

```ts
import {ssmProviderFactory} from '@pallad/config-aws-ssm';
import {SSM} from 'aws-sdk';

const ssm = ssmProviderFactory({
    ssm: new SSM({
        region: 'eu-central-1'
    }),
    prefix: '/env/prod/'
});

ssm('database/password');
```
