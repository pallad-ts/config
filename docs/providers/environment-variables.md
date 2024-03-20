---
sidebar_position: 5
---

# Environment variables

Basic and most common [synchronous](./#introduction-to-providers) provider. Retrieves data from `process.env`.

```ts
import {env, type} from '@pallad/config';

// retrieves `FOO` environment variable
env('FOO');

// retrieves `FOO` environment variable and converts it to int
env('FOO').transform(type.int);

// retrieves `FOO` environment variable and converts it to int, if not available uses: 1000
env('FOO').transform(type.int).defaultTo(1000); 
```
