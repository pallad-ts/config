---
sidebar_position: 25
---

# TOML

[Synchronous](./#introduction-to-providers) provider that loads data
from [TOML](https://toml.io/en/) files.

TOML is a simple configuration file format that's easy to read and write. Definitely much better than JSON or ENV variables.

Using TOML provider has multiple benefits:
* TOML files are easy to read and write
* TOML provider supports merging multiple config files into one final configuration which allows to split configuration into smaller files
* TOML is much better approach for advanced configuration structures

# Installation

```bash npm2yarn
npm install @pallad/config-toml
```

Example
```ts
import {tomlProviderFactory} from '@pallad/config-toml';

const toml = tomlProviderFactory({
    files: [
        'config.toml', // required file
        {path: 'config.dev.toml', required: false} // optional file
    ]
});

// retrieves "database.password" parameter
toml('database.password');
```

And example config file
```toml title="config.toml"
[database]
password = 'test'
```

# Validation

## Validation of entire config
// TODO https://github.com/pallad-ts/config/issues/59

## Validation of single value

Easiest way to [validate single value](../transforming-values#validation) is to use `transform` method. 
See [transform provider docs](../transforming-values) for further customization options.

```ts
import {type} from '@pallad/config';

toml('database.password').transform(type.string).secret();
toml('database.port').transform(type.int).default(5432);
```

# Deep merge

TOML provider uses [deepmerge](https://www.npmjs.com/package/deepmerge) library to merge loaded config into one final object.

For example by default arrays are merged together instead of being replaced by one another. 
You can customize that behavior by providing `deepMerge` option to provider factory.

```ts
import {tomlProviderFactory} from "@pallad/config-toml"; 
const toml = tomlProviderFactory({
    files: ['config.toml'],
    deepMerge: {
        arrayMerge: (destinationArray, sourceArray, options) => sourceArray // overrides previous array with new one
    }
})
``` 

# Overriding values
Since config is merge to one final object and files further down in the list have 
higher priority then previous ones you can easily create developer friendly system to override values.

```ts

import {tomlProviderFactory} from '@pallad/config-toml';

const toml = tomlProviderFactory({
    files: [
        'config.toml',
        {path: 'config.dev.toml', required: false},
    ]
});

```

```toml title="config.toml"
[mailer]
host = 'smtp.gmail.com'
```

At this stage `mailer.host` is `smtp.gmail.com`. But if you provide `config.dev.toml` with the same key it will override it.

```toml title="config.dev.toml"
[mailer]
host = 'smtp.mailtrap.io'
```


