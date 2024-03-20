---
sidebar_position: 15
---

# Transforming values

Transformers are functions that converts value from provider. `@pallad/config` has few built-in transformers but you can
write your own, which is just any function that accepts input value and returns transformed one.

## Integer

Converts value to int. Throws an error if cannot be converted.

```ts
import {env, type} from '@pallad/config';

env('FOO').transform(type.int);
```

## Number

Converts value to number. Throws an error if cannot be converted.

```ts
import {env, type} from '@pallad/config';

env('FOO')(type.number);
```

## Boolean

Converts value to boolean. Throws an error if cannot be converted. Uses glorious [yn](https://www.npmjs.com/package/yn)
library so boolean-ish values like `yes`, `no`, `y`, `on`, `off` etc are allowed.

```ts
import {env, type} from '@pallad/config';

env('FOO').transform(type.bool);
```

## String

:::note

Note about type safety.

Many providers does not provide type safety. 
For example, environment variables are always strings but values from aws-secret-manager are not therefore 
enforcing type of `string` by using transformer is advised way to ensure type safety.

:::

Ensures that value is a string and got trimmed from whitespaces at the beginning and the end.

```ts
import {env, type} from '@pallad/config';

env('FOO')(type.string);
```


## URL

Ensures that value is an URL, throws an error otherwise.

```ts
import {env, type} from '@pallad/config';

env('FOO').transform(type.url);
```

You can enforce certain protocols like `http` or `https`

```ts
import {env, type} from '@pallad/config';

env('FOO').transform(type.url.options({protocols: ['http', 'https']}));
```

## Splitting by separator

Splits value into an array by given separator (by default ","). All array values are trimmed and empty values got
removed.

```ts
import {env, type} from '@pallad/config';

env('FOO').transform(type.split);
```

Custom separator

```ts
import {env, type} from '@pallad/config';

env('FOO').transform(type.split.by( ':'));
```

## Protecting from accidental leak via `@pallad/secret`

[`@pallad/secret`](https://www.npmjs.com/package/@pallad/secret) is a tool that wraps any value and prevents it from being logged, converted to string, inspected etc.
Therefore it will help protect your configuration and secret from accidental leak. 

Wrapping value with `Secret`

```ts
import {env} from '@pallad/config';
import {secret} from '@pallad/config';

env('FOO').secret();
```

Converts value to int and wraps with secret

```ts
import {env, type} from '@pallad/config';
import {protect} from '@pallad/config';

env('FOO').transform(type.int).secret();
```

## Custom transformer and validation

As mentioned before, transformer is just a simple mapping function that accepts loaded value as input, returns
transformed value or throw an error if value is invalid.

```ts
import {env} from '@pallad/config';

function upperCase(value: string) {
    // you can validate input value and throw an error if something is wrong
    return value.toUpperCase();
}

env('FOO').transform(upperCase);
```

