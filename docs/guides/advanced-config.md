---
sidebar_position: 20
---

# Advanced configuration

We've learned how to use [simple providers](./providers) or [presets](./presets) to create configuration for our app.
Now it is time to learn how to create advanced configuration providers tailored for your needs.

In this example we are going to define configuration where non-secret data are stored in TOML files and secrets in AWS Secret Manager (for production and staging). 

The configuration has following shape:
* `app` - contains port and logging level (loaded only from TOML)
* `database` - contains hostname, port, username and password (loaded from TOML and Secret Manager)
* `mailer` - contains type of mailer (loaded from TOML) and depending on type (`file-storage` or `smtp`) it contains different values (loaded from TOML and/or Secret Manager)

:::info

Full example code is available in [here](https://github.com/pallad-ts/config/tree/master/examples/advanced-config).

:::
## Defining providers

Lets start with defining our configuration providers.
```ts
import { info } from "@pallad/app-env";
import { secretManagerProviderFactory } from "@pallad/config-aws-secret-manager";
import { tomlProviderFactory } from "@pallad/config-toml";

export function createConfig() {
    
    const toml = tomlProviderFactory({
        files: [
            `./config/main.toml`, // this file is required
            { path: `./config/${info.name}.toml`, required: false }, // this file is optional and will override values from main.toml
        ],
    });

    // loader of config from AWS Secret Manager
    const secretManager = secretManagerProviderFactory({
        prefix: `/${info.name}/`,
    });
    
    // ....
}
```

Next step is to define simple preset that allows to load values from TOML files and fallback to AWS Secret Manager (only for production and staging environments).

```ts
import { FirstAvailableProvider } from "@pallad/config";

export function createConfig() {
    // ...
    
    // generators are nicer way to define complex providers
    function* tomlAndSecretManagerGenerator(key: string) {
        // always read from toml (to allow override for any env)
        yield toml(key);
    
        // take from secret manager (for production and staging)
        if (info.is("production", "staging")) {
            yield secretManager({name: key});
        }
    }
    
    function tomlAndSecretManager(key: string) {
        return new FirstAvailableProvider(...tomlAndSecretManagerGenerator(key));
    }
    
    // ...
}
```

## Defining configuration shape

Time to define configuration shape. Data loaded from TOML files or AWS Secret Manager are of type `unknown` since their shape cannot be guaranteed.
To enforce final shape of loaded values we're using zod's schemas.
 
```ts
export function createConfig() {
    // ...
    
    const mailerTypeProvider = toml("mailer.type").transform(type.string);
    return {
        // load from TOML and parse through ZOD's schema
        app: toml("app").transform(value => appSchema.parse(value)),
        // could be loaded from TOML and Secret Manager
        database: tomlAndSecretManager("database").transform(value => databaseSchema.parse(value)),
        // depending on mailer type (loaded from TOML) different values are loaded
        mailer: pickByType(mailerTypeProvider)
            // register options for each type of mailer
            .registerOptions("file-storage", {
                file: toml("mailer.file").transform(type.string), // loaded only from TOML
            })
            .registerOptions(
                "smtp",
                tomlAndSecretManager("smtp").transform(value => mailerSmtpSchema.parse(value))
            ),
    };
}

export type Config = ResolvedConfig<ReturnType<typeof createConfig>>;

function wrapWithSecret<T>(value: T) {
    return secret(value);
}

const databaseSchema = z.object({
    hostname: z.string(),
    port: z.number().int().min(1000),
    username: z.string().transform(wrapWithSecret),
    password: z.string().transform(wrapWithSecret),
});

const appSchema = z.object({
    port: z.number().int().min(10),
    loggingLevel: z.enum(["debug", "info", "warn", "error"]),
});

const mailerSmtpSchema = z.object({
    host: z.string(),
    port: z.number().int().min(1),
    username: z.string().transform(wrapWithSecret),
    password: z.string().transform(wrapWithSecret),
});
```

## Testing

```toml title="config/main.toml"
[app]
port = 80
loggingLevel = "info"
```

### Development

We expect development to use its own configuration therefore all the values are defined in `development.toml`.

Note that any value defined here overrides data from `main.toml`.
 
```toml title="config/development.toml"
[app]
port = 3000
loggingLevel = "debug"

[database]
hostname = "localhost"
port = 5432
username = "postgres"
password = "postgres"

[mailer]
type = "file-storage"
file = "logs/email.log"
```

Lets run config cli for it (by default environment is `development`).
```bash
NODE_OPTIONS='-r ts-node/register' pallad-config -c ./src/createConfig.ts
```

```bash
Object {
  "app": Object {
    "loggingLevel": "debug",
    "port": 3000,
  },
  "database": Object {
    "hostname": "localhost",
    "password": **SECRET** (secret),
    "port": 5432,
    "username": **SECRET** (secret),
  },
  "mailer": Object {
    "options": Object {
      "file": "logs/email.log",
    },
    "type": "file-storage",
  },
}
```
For testing purposes lets comment out entire `database` section.

 
```toml title="config/development.toml"
[app]
port = 3000
loggingLevel = "debug"

#[database]
#hostname = "localhost"
#port = 5432
#username = "postgres"
#password = "postgres"

[mailer]
type = "file-storage"
file = "logs/email.log"
```

```bash
Object {
  "app": Object {
    "loggingLevel": "debug",
    "port": 3000,
  },
  "database": Value not available: First available: TOML Config at property path: database,
  "mailer": Object {
    "options": Object {
      "file": "logs/email.log",
    },
    "type": "file-storage",
  },
}
```

Config cannot be loaded since for `development` environment only `TOML` files are allowed to be used, not `AWS Secret Manager`.

### Production

Production config is very simple since we expect that AWS Secret Manager will define rest of secret values.
```toml title="config/production.toml"
[mailer]
type = "smtp"
```

```bash
APP_ENV=production NODE_OPTIONS='-r ts-node/register' pallad-config -c ./src/createConfig.ts
```

```bash
Object {
  "app": Object {
    "loggingLevel": "info",
    "port": 80,
  },
  "database": Value not available: First available: TOML Config at property path: database, Secret name: /production/database,
  "mailer": Value not available: First available: TOML Config at property path: smtp, Secret name: /production/smtp,
}
```

Apparently we forgot to define `database` and `smtp` secrets. 

You can either define them right now or temporarily define missing values in `production.yaml`.
No matter how you achieve it, the end result might look like this.

```bash
Object {
  "app": Object {
    "loggingLevel": "info",
    "port": 80,
  },
  "database": Object {
    "hostname": "rds.aws.amazon.com",
    "password": **SECRET** (secret),
    "port": 5432,
    "username": **SECRET** (secret),
  },
  "mailer": Object {
    "options": Object {
      "host": "smtp.gmail.com",
      "password": **SECRET** (secret),
      "port": 25,
      "username": **SECRET** (secret),
    },
    "type": "smtp",
  },
}
```


