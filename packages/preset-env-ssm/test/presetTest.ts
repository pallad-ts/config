import { createPreset } from "@src/preset";
import DataLoader from "dataloader";
import * as sinon from "sinon";

import { DefaultValueProvider, EnvProvider, FirstAvailableProvider, TransformProvider } from "@pallad/config";
import { EnvFileProvider, envFileProviderFactory } from "@pallad/config-envfile";
import { SSMProvider, ssmProviderFactory } from "@pallad/config-ssm";

describe("preset", () => {
    const ENV_OPTIONS = {
        FOO: "bar",
    };

    const ENV_FILE_OPTIONS: envFileProviderFactory.Options = {
        paths: [{ path: "./envFiles/test.env", required: false }],
    };

    const SSM_OPTIONS: ssmProviderFactory.Options = {
        prefix: "/test/",
    };

    const DEFAULT_VALUE = "some-default-value";

    const KEY = { env: "FOO", ssmKey: "foo" };

    function env(key: string) {
        return new EnvProvider(key, ENV_OPTIONS);
    }

    function envFile(key: string) {
        return new EnvFileProvider(key, expect.anything());
    }

    function ssm(key: string) {
        return new SSMProvider(key, expect.any(DataLoader) as any);
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
                ssm: SSM_OPTIONS,
            });
        });

        it("without transformer", () => {
            const config = preset(KEY);
            expect(config).toMatchObject(new FirstAvailableProvider(env("FOO"), envFile("FOO"), ssm("/test/foo")));
        });

        it("no ssm if ssmKey not provided", () => {
            const config = preset({ env: "FOO" });
            expect(config).toMatchObject(new FirstAvailableProvider(env("FOO"), envFile("FOO")));
        });

        it("only ssm if env key not provided", () => {
            const config = preset({ ssmKey: "foo" });
            expect(config).toMatchObject(new FirstAvailableProvider(ssm("/test/foo")));
        });
    });
});
