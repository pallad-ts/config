---
sidebar_position: 1 
slug: /providers/
---

# Introduction to providers

Provider is an object responsible for loading config value from any source like env variables, files or external
services.

Provider can retrieve values in synchronous, asynchronous way. 
Some providers can also behave like hybrids that use sync or async way depending on additional conditions.

`@pallad/config` supports retrieving values from:

- [Environment variables](./environment-variables)
- [Envfiles](./envfile)
- [AWS SSM Parameter Store](./ssm)

If you need to load values from different source you can define your own [custom provider](#custom-provider).

For usability purposes `@pallad/config` has few composable providers:

* [Default value](./composition#default)
* [Transform](./composition#transform)
* [Pick by type](./pick-by-type)
* [First available](./composition#first-available)
* [Default with transformer](./composition#default-with-transformer)

## Custom provider

For example purposes lets create a new provider that retrieves data from an object.

Every provider **must** extends common `Provider`, otherwise we will not be able to detect it during loading.

```ts
import {Provider, ValueNotAvailable} from '@pallad/config';
import {Validation} from 'monet';

const VALUES = {
    FOO: 'bar',
    BAZ: 'world'
}

export class CustomProvider extends Provider {
    constructor(key) {
        super();
        this.key = key;
    }

    getValue() {
        // if value is available
        if (VALUES[this.key]) {
            // then return it
            return Validation.Success(VALUES[this.key]);
        }

        // otherwise tells that value is not available along with description
        return Validation.Fail(new ValueNotAvailable(`Custom provider: ${this.key}`));
    }
}
```

Usage
```ts
// resolves to "bar"
new CustomProvider('FOO');

// fails to load
new CustomProvider('UNKNOWN');
```