---
sidebar_position: 14
---

# AWS Secret Manager

[AWS Secret Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) is a great tool to provide 
secure storage for your secrets like database passwords, JWT secret keys, API keys. 
Additionally it can be customized to store structures instead of just strings.

Ability to rotate the secrets is a great feature that allows to keep your secrets secure in case of a leak.


## Installation

```bash npm2yarn
npm install @pallad/config-aws-secret-manager
```

## Retrieving secrets

You can retrieve entire secret by providing its name:
```ts
import { secretManagerProviderFactory } from '@pallad/config-aws-secret-manager';

const secretManager = secretManagerProviderFactory();

// retrieves entire "database" secret upon resolution
secretManager({name: 'database'})
```
### Just a property from structured secret

```ts
import { secretManagerProviderFactory } from '@pallad/config-aws-secret-manager';

const secretManager = secretManagerProviderFactory();

// retrieves "database" secret and extracts property `username` from it
secretManager({name: 'database', property: 'username'})
```

## Ensuring type safety

All values fetched from secret manager are treated as `unknown` therefore extra validation is required to ensure type safety.

### For property

```ts
import {type} from '@pallad/config';

// ensures that `username` property is a string
secretManager({name: 'database', property: 'username'}).transform(type.string);

// port to be an integer
secretManager({name: 'database', property: 'port'}).transform(type.int);

// custom validation
secretManager({name: 'database', property: 'password'}).transform((value) => {
    if (someTypeCheck(value)) {
        return value;
    }
    throw new Error('Invalid value');
});
```

### For structure

Transform properties for type safety is easy but it can be cumbersome for complex structures therefore using `transform` on entire secret might recommended.
```ts
import {type} from '@pallad/config';

import {z} from 'zod';

const databaseSchema = z.object({
    username: z.string(),
    password: z.string(),
    port: z.number()
});

// ensures that entire secret is an object satisfying `databaseSchema`
secretManager({name: 'database'}).transform((value) => {
    return databaseSchema.parse(value);
});
```

## Customization

### Prefix all secret names

```ts
import { secretManagerProviderFactory } from '@pallad/config-aws-secret-manager';

const secretManager = secretManagerProviderFactory({
    prefix: '/env/prod/'
});

// retrieves "/env/prod/database" secret
secretManager('database')
```

### Use custom instance of Secret Manager client

```ts
import { ssmProviderFactory } from '@pallad/config-aws-ssm';
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const secretManager = secretManagerProviderFactory({
    client: new SecretsManagerClient({region: 'us-east-1'})
});
// retrieves "/env/prod/database" secret from `us-east-1` region
secretManager('database')
```

### Deserialization

By default, all secrets are stored as strings. If data looks like a JSON then it is being deserialized.
If you need more control over deserialization you can provide custom deserializer.

```ts
import { SecretValueEntry } from "@aws-sdk/client-secrets-manager";

const secretManager = secretManagerProviderFactory({
    deserialize(secret: SecretValueEntry) {
        if (secret.SecretString) {
            return customJSONDeserializer(secret.SecretString);
        }
        
        throw new Error('Unsupported secret format');
    }
});
```
