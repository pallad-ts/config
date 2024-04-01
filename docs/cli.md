---
sidebar_position: 12
---

# CLI

CLI allows you to display and/or validate your configuration. You can run this command with different options (like env
variables, [environment indicators](./guides/application-environments)) to test configuration in different conditions.

Installation first

```bash npm2yarn
npm install @pallad/config-cli
```

## Example usage
```bash
pallad-config -c ./src/config.mjs
```

Displays
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

## Specifying configuration file

Loads configuration shape defined as `default` export.
```shell
pallad-config -c ./src/config.js
```

Uses `createConfig` function (that suppose to return configuration shape) as configuration source.
```shell
pallad-config -c ./src/config.js -p createConfig
```

### Loading typescript file
Node.js itself cannot load typescript files therefore you need to use `ts-node` (or others). 
See [ts-node documentation](https://www.npmjs.com/package/ts-node#node-flags-and-other-tools) for more details.

```shell
NODE_OPTIONS='-r ts-node/register' pallad-config -c ./src/config.ts
```

## Display modes

### `all`
Default mode in which values and errors are displayed

Example output with errors
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

Example output without errors
```shell
Object {
  "database": Object {
    "hostname": "database.internal",
    "password": **SECRET** (secret),
    "port": 5432,
    "username": **SECRET** (secret),
  },
}
```

### `fails-only`
Displays only errors. Useful for CI/CD pipelines to quickly check whether configuration is valid and prevent logging configuration.

```shell
    ConfigError: Value not available: ENV: DATABASE_USERNAME
    Code: E_CONF_2
    ConfigError: Value not available: ENV: DATABASE_PASSWORD
    Code: E_CONF_2
```

### `none`
Displays nothing even in case of failure. Use [exit code](#exit-code) to check whether loading was successful. 

## Exit code

CLI uses exit code 1 when loading configuration fails, otherwise returns 0.

## CLI options

```shell
Display config created with @pallad/config

USAGE
  $ pallad-config  -c <value> [--revealSecrets] [-d none|fails-only|all] [-p <value>]

FLAGS
  -c, --config=<value>          (required) Path to the file with configuration
  -d, --display=<option>        [default: all]
                                <options: none|fails-only|all>
  -p, --configProperty=<value>  Name of property, from config module, to use for configuration shape. If not provided
                                `default` or module main export will be used.
      --revealSecrets           Reveal secret values from @pallad/secret
```
