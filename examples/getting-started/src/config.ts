import { env } from "@pallad/config";

export function createConfig() {
    return {
        database: {
            hostname: env("DATABASE_HOSTNAME"),
            port: 5432,
            username: env("DATABASE_USERNAME").secret(),
            password: env("DATABASE_PASSWORD").secret(),
        },
    };
}
