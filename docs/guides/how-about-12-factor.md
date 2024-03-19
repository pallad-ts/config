---
sidebar_position: 10
---

# Twelve-factor app

Twelve-factor app is a methodology for building software-as-a-service that aimed to be scalable and maintainable.
 It was introduced by Heroku in 2011 and is widely used in the industry.

Rule number 3 for configuration sounds like this:
> The twelve-factor app stores config in environment variables
> 
> (...)
> 
> This includes:
>  
> * Resource handles to the database, Memcached, and other backing services
> * Credentials to external services such as Amazon S3 or Twitter
> * Per-deploy values such as the canonical hostname for the deploy

Seems quite reasonable. What is the problem with that?

## The problem

Environments variables aren't actually very secure.

Any piece of code in the app can get easy access to `process.env` and do whatever it wants (deleting, amending etc) 
or even worse - accidentally log them.

Environment variables are inherited by child processes. 
That means running any third party processes automatically exposes all the environment variables to them and you hope it won't do anything nasty with them.

Crash log might contain environment variables thus expose secrets in logs.

## Solution

`@pallad/config` will not only help you to manage your configuration but also secure it by wrapping secrets with `@pallad/secret` to prevent all of above issues.

## Is twelve-factor app wrong then?

Kinda yes.
 
I'm not saying that using environment variables is a bad idea in general but there are better alternatives you should consider.

Note that twelve-factor app was introduced by Heroku which is a PaaS provider. Heroku does not have other way to share
 secrets other than environment variables therefore they would never claim that using 
 environment variables is not fully secure since that would undermine their own product.


