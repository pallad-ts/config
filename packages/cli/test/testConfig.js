const {Secret, secret, protect} = require("@pallad/secret");
const {env, pickByType, type} = require("@pallad/config");

module.exports = () => {
    return {
        database: {
            hostname: 'hostname',
            port: 5432,
            username: new Secret('username'),
            password: env('DATABASE_PASSWORD', {
                transformer: secret
            }),
            schema: env('DATABASE_SCHEMA', {default: undefined})
        },
        scheduler: pickByType(
            env('SCHEDULER_TYPE')
        )
            .registerOptions('static', {
                value: env('SCHEDULER_STATIC_VALUE'),
                value2: env('SCHEDULER_STATIC_VALUE_2')
            })
            .registerOptions('dynamic', {
                dns: env('SCHEDULER_DYNAMIC_ADDRESS')
            }),
        usernames: {
            fake: env('USERNAMES_FAKE', {
                transformer: type.split
            })
        },
        jwt: {
            secret: env('JWT_SECRET', {
                transformer: protect(
                    type.split.by({
                        separator: ',',
                        transformer: type.split.by({separator: ':'})
                    })
                )
            })
        }
    };
}
