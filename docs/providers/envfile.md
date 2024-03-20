---
sidebar_position: 10
---

# Envfile

[Synchronous](./#introduction-to-providers) provider that sources variables from envfiles. In order to use it you need to create a helper to tell which envfiles to use.

But first... installation
```bash npm2yarn
npm install @pallad/config-envfile
```

Creating envfile helper.

```ts
import {envFileProviderFactory} from '@pallad/config-envfile';

const envFile = envFileProviderFactory({
    paths: ['.env'] // loads ".env" from current working directory
})

envFile('FOO') // uses `FOO` variable from ".env" file

// converts to int
envFile('FOO').transform(type.int);

// converts it to int, if not available uses: 1000
envFile('FOO').transform(type.int).defaultTo(1000); 
```

## Customization
```ts
import {envFileProviderFactory} from '@pallad/config-envfile';

const envFile = envFileProviderFactory({
    files: [
        // ignores if does not exist
        {path: 'development.env', required: false},
        // additionally loads production envfile and overrides all variables with same name defined in previous files
        {path: 'production.env', required: false},  
        '.env' // requires file to exist
    ],
    cwd: '../config', // custom working directory - default process.cwd
});
```


## Populating to ENV

Variables loaded from ENV files are not by default applied to `process.env`.

You can however populate them by calling `populateToEnv`
```ts
const envFile = envFileProviderFactory({
    files: [
        // ignores if does not exist
        {path: 'development.env', required: false},
        // additionally loads production envfile and overrides all variables with same name defined in previous files
        {path: 'production.env', required: false},  
        '.env' // requires file to exist
    ],
    cwd: '../config', // custom working directory - default process.cwd
});

envFile.populateToEnv(); // populates all loaded variables to process.env

// populates only the ones that satisfy the predicate
envFile.populateToEnv((key) => {
    return key === 'AWS_REGION';
})
```
