import { envFileProviderFactory } from "@src/envFileProviderFactory";
import { DefaultValueProvider, ValueNotAvailable } from "@pallad/config";
import { assert, IsExact } from "conditional-type-checks";
import { EnvFileProvider } from "@src/EnvFileProvider";
import { left, right } from "@sweet-monads/either";

describe("envFileProviderFactory", () => {
    describe("types", () => {
        const factory = envFileProviderFactory({
            paths: "./example/base.env",
            cwd: __dirname,
        });

        it("no default and transformer", () => {
            const provider = factory("FOO");

            type Input = typeof provider;
            type Expected = EnvFileProvider;
            assert<IsExact<Input, Expected>>(true);
        });
    });

    it("simple case", () => {
        const factory = envFileProviderFactory({
            paths: "./example/base.env",
            cwd: __dirname,
        });

        expect(factory("FOO").getValue()).toStrictEqual(right("bar"));

        expect(factory("HELLO").getValue()).toStrictEqual(right("world"));
    });

    it("overriding env from previous files", () => {
        const factory = envFileProviderFactory({
            paths: ["./example/base.env", "./example/override.env"],
            cwd: __dirname,
        });

        expect(factory("FOO").getValue()).toStrictEqual(right("world"));
    });

    it("fails if env file does not exist and ignoring is disabled", () => {
        expect(() => {
            envFileProviderFactory({
                paths: "./example/test.env",
                cwd: __dirname,
            });
        }).toThrowErrorMatchingSnapshot();
    });

    it("silently ignores file if it is not required", () => {
        const factory = envFileProviderFactory({
            paths: { path: "./example/test.env", required: false },
            cwd: __dirname,
        });

        expect(factory("FOO").getValue()).toStrictEqual(left(new ValueNotAvailable('"FOO" from ENV file(s)')));
    });

    it("populates process env if set", () => {
        envFileProviderFactory({
            paths: "./example/populate.env",
            cwd: __dirname,
            populateToEnv: true,
        });

        expect(process.env.PALLAD_CONFIG_TEST_VALUE).toStrictEqual("test");
    });
});
