import { EnvFileProvider } from "@src/EnvFileProvider";
import { envFileProviderFactory } from "@src/envFileProviderFactory";
import { left, right } from "@sweet-monads/either";
import { assert, IsExact } from "conditional-type-checks";
import * as sinon from "sinon";

import { DefaultValueProvider, ValueNotAvailable } from "@pallad/config";

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
            }).load();
        }).toThrowErrorMatchingSnapshot();
    });

    it("silently ignores file if it is not required", () => {
        const factory = envFileProviderFactory({
            paths: { path: "./example/test.env", required: false },
            cwd: __dirname,
        });

        expect(factory("FOO").getValue()).toStrictEqual(left(new ValueNotAvailable('"FOO" from ENV file(s)')));
    });

    describe("populating to env", () => {
        let originalEnv = process.env;
        beforeEach(() => {
            originalEnv = { ...process.env };
        });

        afterEach(() => {
            process.env = { ...originalEnv };
        });

        it("all env", () => {
            const factory = envFileProviderFactory({
                paths: "./example/populate.env",
                cwd: __dirname,
            });

            factory.populateToEnv();
            expect(process.env.PALLAD_CONFIG_TEST_VALUE).toStrictEqual("test");
            expect(process.env.PALLAD_CONFIG_TEST_VALUE2).toStrictEqual("test2");
        });

        it("only the ones accepted by predicate", () => {
            const factory = envFileProviderFactory({
                paths: "./example/populate.env",
                cwd: __dirname,
            });

            const stub = sinon.stub().callsFake((key: string) => key === "PALLAD_CONFIG_TEST_VALUE2");
            factory.populateToEnv(stub);

            expect(process.env.PALLAD_CONFIG_TEST_VALUE).toBeUndefined();
            expect(process.env.PALLAD_CONFIG_TEST_VALUE2).toStrictEqual("test2");

            sinon.assert.calledWith(stub, "PALLAD_CONFIG_TEST_VALUE", "test");
            sinon.assert.calledWith(stub, "PALLAD_CONFIG_TEST_VALUE2", "test2");
        });
    });
});
