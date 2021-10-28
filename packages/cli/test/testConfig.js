const {Secret} = require("@pallad/secret");
const {env, pickByType} = require("@pallad/config");

module.exports = () => {
    return {
        database: {
            hostname: 'hostname',
            port: 5432,
            username: new Secret('username'),
            password: new Secret('password'),
            schema: env('DATABASE_SCHEMA')
        },

        scheduler: pickByType(
            env('SCHEDULER_TYPE')
        )
            .registerOptions('static', {
                value: env('SCHEDULER_STATIC_VALUE')
            })
            .registerOptions('dynamic', {
                dns: env('SCHEDULER_DYNAMIC_ADDRESS')
            })
    };
}
