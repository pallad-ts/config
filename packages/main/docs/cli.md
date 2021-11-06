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

## Setup

Now you need to define where your configuration is actually stored. CLI
uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) so you can define configuration in the way that is most
suitable for you.

Just few of available options:

- under `pallad-config` key in `package.json`
- in `.pallad-configrc` file
- in `pallad-config.js` file
- in `pallad-config.config.js` like


### Configuration options

`file` property has to be defined to indicate location of configuration file module.

`@pallad/config` will try to find first available function in that module and use it as configuration source. If that
fails then you need to provide `property` to clearly indicate property of module containing function responsible for
creating configuration.

```json title=pallad-config.json
{
    "file": "./src/config", 
}
```

## Example usage
```bash
pallad-config
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

## Exit code

If loading configuration fails then command return exit code 1, otherwise returns 0.

This allows for easy CI integration and check very early at deployment process whether configuration is valid.

## Displaying subset of configuration

You can display only subset of your configuration by providing path to property you wish to display

```bash
pallad-config database.hostname
```

```shell
localhost
```

## CLI options

```shell
Display config created with @pallad/config

USAGE
  $ pallad-config [CONFIGPATH]

ARGUMENTS
  CONFIGPATH  config property path to display

OPTIONS
  -s, --silent     Do not display config
  --revealSecrets  Whether to reveal secret values from @pallad/secret
```
