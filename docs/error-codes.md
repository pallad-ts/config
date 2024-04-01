---
sidebar_position: 25
---

# Error codes
List of most important errors 

## E_CONF_1

`Config loading failed: %s`

You've attempted to load configuration via `loadSync` or `loadAsync` but some or providers have failed to retrieve value.
Take a look at `errors` property or error message for detailed list of problems occurred during loading.

## E_CONF_2

`Value not available: %s`

Provider could not load value. Second part of message indicates what property in external source is not defined. 

## E_CONF_3

`Cannot load config synchronously since one of your config value provider is asynchronous`

As message states. Use `loadAsync` instead to load such config or remove provider that works in asynchronous way.
See [usage section](./usage#asynchronous-loading) for more details how to load configuration asynchronously.


## E_CONF_4

`Unregistered type "%s". Registered values: %s`

Error thrown by [pick by type provider](./providers/pick-by-type) when value resolved by type provider is not registered.
Most likely you've provided wrong value for type provider or you've forgotten to register options for the type.


## E_CONF_5

`Type "%s" already registered`

Error thrown by [pick by type provider](./providers/pick-by-type) when attempt or registering a type that is already defined took place.
We throw this error to prevent accidental override of options for a type.


## E_CONF_6
## E_CONF_7
## E_CONF_8

`Value "%s" cannot be converted to %s`

As message states. Use configuration value suitable for given type.

## E_CONF_9

`Protocol "%s" is not allowed. Allowed: %s`

Value provided to [url transformer](transforming-values#url) is an url but uses invalid protocol.


## E_CONF_10

`Value "%s" cannot be converted to ISO duration`

Value provided to [duration transformer](transforming-values#duration) is not a valid ISO duration string.

## E_CONF_11

`Duration "%s" is not in valid range %s`

Provided duration does not fit configured range.
