import { z } from "zod";

import { info } from "@pallad/app-env";
import { FirstAvailableProvider, pickByType, ResolvedConfig, type } from "@pallad/config";
import { secretManagerProviderFactory } from "@pallad/config-aws-secret-manager";
import { tomlProviderFactory } from "@pallad/config-toml";
import { secret } from "@pallad/secret";

export default function createConfig() {
    const toml = tomlProviderFactory({
        files: [
            `./config/main.toml`, // this file is required
            { path: `./config/${info.name}.toml`, required: false }, // this file is optional
        ],
    });

    // setup provider factory for AWS Secret Manager data but for production only
    const secretManager = secretManagerProviderFactory({
        prefix: `/${info.name}/`,
    });

    function* tomlAndSecretManagerGenerator(key: string) {
        // always read from toml (to allow override for any env)
        yield toml(key);

        // take from secret manager if available (for production and staging)
        if (info.is("production", "staging")) {
            yield secretManager({ name: key });
        }
    }

    function tomlAndSecretManager(key: string) {
        return new FirstAvailableProvider(...tomlAndSecretManagerGenerator(key));
    }

    const mailerTypeProvider = toml("mailer.type").transform(type.string);

    return {
        app: toml("app").transform(value => appSchema.parse(value)),
        database: tomlAndSecretManager("database").transform(value => databaseSchema.parse(value)),
        mailer: pickByType(mailerTypeProvider)
            .registerOptions("file-storage", {
                file: toml("mailer.file").transform(type.string),
            })
            .registerOptions(
                "smtp",
                tomlAndSecretManager("smtp").transform(value => mailerSmtpSchema.parse(value))
            ),
    };
}

export type Config = ResolvedConfig<ReturnType<typeof createConfig>>;

function wrapWithSecret<T>(value: T) {
    return secret(value);
}

const databaseSchema = z.object({
    hostname: z.string(),
    port: z.number().int().min(1000),
    username: z.string().transform(wrapWithSecret),
    password: z.string().transform(wrapWithSecret),
});

const appSchema = z.object({
    port: z.number().int().min(10),
    loggingLevel: z.enum(["debug", "info", "warn", "error"]),
});

const mailerSmtpSchema = z.object({
    host: z.string(),
    port: z.number().int().min(1),
    username: z.string().transform(wrapWithSecret),
    password: z.string().transform(wrapWithSecret),
});
