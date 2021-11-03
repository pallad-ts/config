import {env} from '@pallad/config';
import {secret} from '@pallad/secret';

export function createConfig() {
    return {
        database: {
            hostname: env('DATABASE_HOSTNAME'),
            port: 5432,
            username: env('DATABASE_USERNAME', {transformer: secret}),
            password: env('DATABASE_PASSWORD', {transformer: secret})
        }
    };
}
