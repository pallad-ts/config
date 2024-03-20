---
sidebar_position: 11
---

# Philosophy

The main goal of `@pallad/config` is to be helpful at every stage of application development.

**Development for programmers**

Configuration must be accessible in type-safe manner for typescript based codebase. That will limit amount of errors or bugs
caused by typos or configuration misuse. 

If you want to have an access to database configuration then you can be sure that ```config.database.username``` will be
available. Moreover if you've protected that value with `@pallad/secret` then you can also be sure
that ```config.database.username.getValue()``` will always work since typescript will tell you that username is
a `Secret` object.

**Debugging for devops and programmers**

Since configuration structure is easily available then CLI can analyze it and tell you very early if there is something wrong in it.
That allows to ensure, even at [continuous integration](./guides/validation-from-ci) stage, that your configuration is valid or debug it in secure way.
