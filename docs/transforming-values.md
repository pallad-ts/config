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

## Duration

Ensures that value is a valid ISO duration string and transforms it to `Duration` object. Throws an error otherwise.

```ts
import {env, type} from '@pallad/config';

env('CACHE_TTL').transform(type.duration);
```

Type of `Duration` object
```ts
export interface Duration {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}
```

See docs for `iso8601-duration` package docs for more 
details [https://www.npmjs.com/package/iso8601-duration](https://www.npmjs.com/package/iso8601-duration) 
and helpers function such `toSeconds` that allow to convert duration object to seconds.

:::note

I wish we could use new standard [Temporal's Duration](https://tc39.es/proposal-temporal/docs/#Temporal-Duration) but polyfill is experimental and not ready for production yet.

:::

### Validate duration min and max values

Ensures that value is between a second or a day. `min` and `max` options are optional.
```ts
import {env, type} from '@pallad/config';

env('CACHE_TTL').transform(type.duration.options({
    min: {seconds: 1}, // or `PT1S`
    max: {days: 1} // or `P1D`
}));
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

env('FOO').transform(type.split.by(':'));
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

