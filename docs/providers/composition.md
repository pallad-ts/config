---
sidebar_position: 20
---

# Composing providers

Embracing famous `composition over inheritance` advice, `@pallad/config` defines
few [hybrid](./#introduction-to-providers) providers for composition.

## Default value

Uses default value if injected provider's value is not available.

```ts
import {DefaultValueProvider, env} from '@palla/config';

// uses 1000 if there is no `FOO` env variable available
const provider = new DefaultValueProvider(
    env('FOO'),
    1000
);
```

## Transform

Transforms value (if available) using provided transforming function.

`@pallad/config` has few [built-in transformers](../transforming-values).

```ts
import {TransformProvider, env} from '@pallad/config';

// for env variable FOO=world returns "WORLD"
const provider = new TransformProvider(
    env('FOO'),
    value => value.toUpperCase()
);
```

## First available
Returns first available value. If non is available then fails. It's great for creating your own presets of providers.

```ts
import {env, FirstAvailableProvider} from '@pallad/config';
import {envFileProviderFactory} from '@pallad/config-envfile';

const envFile = envFileProviderFactory({
    paths: ['.env']
});

// gets value from env variable FOO, if that is not available fallback to FOO from envfile
const provider = new FirstAvailableProvider(
    env('FOO'),
    envFile('FOO')
);
```

## Default with transformer

Just simple helper to easily wrap any provider with default value and/or transformer.

```ts
import {wrapWithDefaultAndTransformer, env, type} from '@pallad/config';

const envProvider = env('FOO');

// returns just envProvider since there is no default or transformer
wrapWithDefaultAndTransformer(envProvider)

// returns envProvider wrapped with DefaultValueProvider
wrapWithDefaultAndTransformer(envProvider, {default: 'BAR'})

// returns envProvider wrapped with DefaultValueProvider and TransformProvider
wrapWithDefaultAndTransformer(envProvider, {default: 'BAR', transform: type.int})

// returns envProvider wrapped with TransformProvider
wrapWithDefaultAndTransformer(envProvider, { transform: type.int})
```

