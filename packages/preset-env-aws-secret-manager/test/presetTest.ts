import { createPreset, Preset } from "@src/preset";
// eslint-disable-next-line @typescript-eslint/naming-convention
import DataLoader from "dataloader";

import { EnvProvider, FirstAvailableProvider } from "@pallad/config";
import {
    SecretManagerProvider,
    secretManagerProviderFactory,
    SecretReference,
} from "@pallad/config-aws-secret-manager";
import { EnvFileProvider, envFileProviderFactory } from "@pallad/config-envfile";

describe("preset", () => {
    const ENV_OPTIONS = {
        FOO: "bar",
    };

    const ENV_FILE_OPTIONS: envFileProviderFactory.Options = {
        files: [{ path: "./envFiles/test.env", required: false }],
    };

    const SECRET_MANAGER_OPTIONS: secretManagerProviderFactory.Options = {
        prefix: "/test/",
    };

    const KEY: Preset.Key = { env: "FOO", secretReference: { name: "foo" } };

    function env(key: string) {
        return new EnvProvider(key, ENV_OPTIONS);
    }

    function envFile(key: string) {
        return new EnvFileProvider(key, expect.anything());
    }

    function secretManager(reference: SecretReference) {
        return new SecretManagerProvider(reference, expect.any(DataLoader) as any);
    }

    describe("env without envFile due to lack of envFile config", () => {
        let preset: ReturnType<typeof createPreset>;
        beforeEach(() => {
            preset = createPreset({
                env: ENV_OPTIONS,
            });
        });

        it("without transformer", () => {
            const config = preset(KEY);

            expect(config).toMatchObject(new FirstAvailableProvider(env("FOO")));
        });
    });

    describe("env with envFile", () => {
        let preset: ReturnType<typeof createPreset>;

        beforeEach(() => {
            preset = createPreset({
                env: ENV_OPTIONS,
                envFile: ENV_FILE_OPTIONS,
            });
        });

        it("without transformer", () => {
            const config = preset(KEY);

            expect(config).toMatchObject(new FirstAvailableProvider(env("FOO"), envFile("FOO")));
        });
    });

    describe("env with envFile and ssm", () => {
        let preset: ReturnType<typeof createPreset>;

        beforeEach(() => {
            preset = createPreset({
                env: ENV_OPTIONS,
                envFile: ENV_FILE_OPTIONS,
                secretManager: SECRET_MANAGER_OPTIONS,
            });
        });

        it("without transformer", () => {
            const config = preset(KEY);
            expect(config).toMatchObject(
                new FirstAvailableProvider(env("FOO"), envFile("FOO"), secretManager({ name: "/test/foo" }))
            );
        });

        it("no secret manager if secret reference not provided", () => {
            const config = preset({ env: "FOO" });
            expect(config).toMatchObject(new FirstAvailableProvider(env("FOO"), envFile("FOO")));
        });

        it("only secret manager if env key not provided", () => {
            const config = preset({ secretReference: { name: "foo" } });
            expect(config).toMatchObject(new FirstAvailableProvider(secretManager({ name: "/test/foo" })));
        });
    });
});
