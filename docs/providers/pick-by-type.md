---
sidebar_position: 20
---

# Pick by type
A little bit advanced [hybrid](./#introduction-to-providers) provider that resolves options based on given type.
This is especially useful for picking different logic strategies where each of them might have different options.

Value from this provider always resolves to object with following properties
* `type` - string - union type of all registered types
* `options` - depending on type - values registered for corresponding type

```ts
const provider = pickByType(env('EMAIL_STRATEGY'))
    .registerOptions('real', {
        smtp: {
            hostname: env('EMAIL_SMTP_HOSTNAME'),
            password: env('EMAIL_SMTP_PASSWORD', {transformer: secret})
        }
    })
    .registerOptions('logs', {
        path: env('EMAIL_LOGS_LOCATION').defaultTo('/tmp/email_logs')
    })
    .registerOptions('forward', {
        path: env('EMAIL_FORWARD_ADDRESS').defaultTo('dev@example.com')
    });


const config = loadSync(provider);

// typeof config['type'] resolves to 'logs' | 'real' | 'forward'

if (config.type === 'logs') {
    console.log(config.options.path);
    // console.log(config.options.smtp) 
    // this would not work and typescript would complain about it
    // since `smtp` is available for type of "real" only
} else if (config.type === 'real') {
    console.log(config.options.smtp);
} else if (config.type === 'forward') {
    console.log(config.options.path)
}
```
