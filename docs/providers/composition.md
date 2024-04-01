---
sidebar_position: 20
---

# Composing providers

Embracing famous `composition over inheritance` advice, `@pallad/config` defines
few [hybrid](./#introduction-to-providers) providers for composition.

## Default value

Uses default value if injected provider's value is not available.

```ts
import {DefaultValueProvider, env} from '@pallad/config';

// uses 1000 if there is no `FOO` env variable available
env('FOO').defaultTo(1000);
```

### Making value optional

If value is not required you can default it to `undefined` by calling `.optional()`.

```ts
env('FOO').optional();
// the same as
env('FOO').defaultTo(undefined);
```

## Transform

Transforms value (if available) using provided transforming function.

`@pallad/config` has few [built-in transformers](../transforming-values).

```ts
import {TransformProvider, env} from '@pallad/config';

env('FOO').transform(value => value.toUpperCase());
```


:::info

Using `.transform()` is a main way to ensure type safety since the inferred value type comes from return type of function passed to it.
Use it in case of any problems with type inference.

:::

## First available
Returns first available value. If non is available then fails. It's great for creating your own presets of providers.

```ts
import {env, FirstAvailableProvider} from '@pallad/config';
import {envFileProviderFactory} from '@pallad/config-envfile';

const envFile = envFileProviderFactory({
    files: ['.env']
});

// gets value from env variable FOO, if that is not available fallback to FOO from envfile
const provider = new FirstAvailableProvider(
    env('FOO'),
    envFile('FOO')
);
```
