import { envProviderFactory, pickByType, type } from "@pallad/config";
import { Secret } from "@pallad/secret";

export function config(envData: Record<string, string>) {
    const env = envProviderFactory(envData);
    return {
        database: {
            hostname: "hostname",
            port: 5432,
            username: new Secret("username"),
            password: env("DATABASE_PASSWORD").secret(),
            schema: env("DATABASE_SCHEMA").optional(),
        },
        scheduler: pickByType(env("SCHEDULER_TYPE"))
            .registerOptions("static", {
                value: env("SCHEDULER_STATIC_VALUE"),
                value2: env("SCHEDULER_STATIC_VALUE_2"),
            })
            .registerOptions("dynamic", {
                dns: env("SCHEDULER_DYNAMIC_ADDRESS").transform(type.url),
            }),
        usernames: {
            fake: env("USERNAMES_FAKE").transform(type.split),
        },
        jwt: {
            secret: env("JWT_SECRET").transform(type.split.by(",")).secret(),
        },
    };
}

export const configData = {
    DATABASE_PASSWORD: "database password",
    DATABASE_SCHEMA: "test",
    SCHEDULER_TYPE: "dynamic",
    SCHEDULER_DYNAMIC_ADDRESS: "http://localhost:8080",
    JWT_SECRET: "s1,s2,s3",
    USERNAMES_FAKE: "tommy, john, jerry",
};
