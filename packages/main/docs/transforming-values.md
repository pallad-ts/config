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

env('FOO', {transformer: type.int});
```

## Number

Converts value to number. Throws an error if cannot be converted.

```ts
import {env, type} from '@pallad/config';

env('FOO', {transformer: type.number});
```

## Boolean

Converts value to boolean. Throws an error if cannot be converted. Uses glorious [yn](https://www.npmjs.com/package/yn)
library so boolean-ish values like `yes`, `no`, `y`, `on`, `off` etc are allowed.

```ts
import {env, type} from '@pallad/config';

env('FOO', {transformer: type.bool});
```

## String

Ensures that value is a string and got trimmed from whitespaces at the beginning and the end.

```ts
import {env, type} from '@pallad/config';

env('FOO', {transformer: type.string});
```

## URL

Ensures that value is an URL, throws an error otherwise.

```ts
import {env, type} from '@pallad/config';

env('FOO', {transformer: type.url});
```

You can enforce certain protocols like `http` or `https`

```ts
import {env, type} from '@pallad/config';

env('FOO', {transformer: type.url.options({protocols: ['http', 'https']})});
```

## Splitting by separator

Splits value into an array by given seperator (by default ","). All array values are trimmed and empty values got
removed.

```ts
import {env, type} from '@pallad/config';

env('FOO', {transformer: type.split});
```

Custom separator

```ts
import {env, type} from '@pallad/config';

env('FOO', {transformer: type.split.by({separator: ':'})});
```

Uses custom separator and additionally transforms every array value to int

```ts
import {env, type} from '@pallad/config';

env('FOO', {
    transformer: type.split.by({
        separator: ':',
        transformer: type.int
    })
});
```

## Protecting from accidental leak via `@pallad/secret`

[`@pallad/secret`](https://www.npmjs.com/package/@pallad/secret) is a tool that wraps any value and prevents it from being logged, converted to string, inspected etc.
Therefore it will help protect your configuration and secret from accidental leak. 

Wrapping value with `Secret`

```ts
import {env} from '@pallad/config';
import {secret} from '@pallad/config';

env('FOO', {transformer: secret});
```

Converts value to int and wraps with secret

```ts
import {env, type} from '@pallad/config';
import {protect} from '@pallad/config';

env('FOO', {transformer: protect(type.int)});
```

## Custom transformer

As mentioned before, transformer is just a simple mapping function that accepts loaded value as input and returns
transformed value.

```ts
import {env} from '@pallad/config';

function upperCase(value: string) {
    // you can validate input value and throw an error if something is wrong
    return value.toUpperCase();
}

env('FOO', {transformer: upperCase});
```
