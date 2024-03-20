---
sidebar_position: 20
---

# Typescript

There is a good chance that your entire configuration shape might be inferred by typescript automatically.

```ts
import {ResolvedConfig, type} from '@pallad/config';

export function createConfig() {
    // return configuration shape
    return {
        mailer: {
            email: env('EMAIL_FROM'),
            smtp: {
                port: env('EMAIL_SMTP_PORT').transform(type.int),
                password: env('EMAIL_SMTP_PASSWORD').defaultTo(undefined)
            }
        }
    }
}

export type Config = ResolvedConfig<ReturnType<typeof createConfig>>;

// typescript infers shape of config to
{
    mailer: {
        email: string;
        smtp: {
            port: number;
            password: string | undefined
        }
    }
}
```

Then you can reuse the resolved configuration shape later
```ts
export function createMailer(config: Config['mailer']) {
    config.mailer.email // string
    config.smtp.password // string | undefined
}
```

## Inferring problems
If for some reason config shape cannot be properly inferred then 
please ensure that `default` and/or `transformer` properties are properly typed.

```ts
export function createConfig() {
    return {
        ssl: {
            // we cannot infer shape of JSON
            config: env('SSL_CONFIG').transform(JSON.parse)
        }
    }
}

const config = loadSync(createConfig());

// looks fine for typescript, but there is no such property 
config.ssl.config.unknownProperty.foo;
```

```ts
function parseSSLConfig(config: string) {
    const result = JSON.parse(config);
    // parse and validate it
    
    return {
        privateKey: result.privateKey as string,
        publicKey: result.publicKey as string
    };
}
export function createConfig() {
    return {
        ssl: {
            config: env('SSL_CONFIG').transform(parseSSLConfig)
        }
    }
}

const config = loadSync(createConfig());

// now it fails as it should
config.ssl.config.unknownProperty.foo;
```

