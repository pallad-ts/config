import { ERRORS } from "@src/errors";
import { tomlProviderFactory } from "@src/tomlProviderFactory";
import { realpathSync } from "node:fs";
import * as path from "node:path";

import "@pallad/errors-dev";

describe("tomlProviderFactory", () => {
    const FIXTURES_DIR = realpathSync(path.join(__dirname, "fixtures"));

    it("main factory produces provider", () => {
        const factory = tomlProviderFactory({
            files: [{ path: path.join(FIXTURES_DIR, "base.toml"), required: true }],
        });

        const provider = factory("foo");
        expect(provider.getValue().unwrap()).toBe("bar");
    });

    describe("loading", () => {
        it("fails if required file does not exist", () => {
            const factory = tomlProviderFactory({
                files: [{ path: path.join(FIXTURES_DIR, "non-existing.toml"), required: true }],
            });

            expect(() => {
                factory.load();
            }).toThrowErrorWithCode(ERRORS.ENV_FILE_DOES_NOT_EXIST);
        });

        it("basic loading", () => {
            const factory = tomlProviderFactory({
                files: [{ path: path.join(FIXTURES_DIR, "base.toml"), required: true }],
            });

            expect(factory.load()).toMatchSnapshot();
        });

        it("ignore non required and non existing files", () => {
            const factory = tomlProviderFactory({
                files: [{ path: path.join(FIXTURES_DIR, "non-existing.toml"), required: false }],
            });
            expect(factory.load()).toEqual({});
        });

        it("merges multiple files", () => {
            const factoryBase = tomlProviderFactory({
                files: [{ path: path.join(FIXTURES_DIR, "base.toml"), required: true }],
            });

            const factory = tomlProviderFactory({
                files: [
                    { path: path.join(FIXTURES_DIR, "base.toml"), required: true },
                    { path: path.join(FIXTURES_DIR, "section.toml"), required: true },
                ],
            });

            expect(factoryBase.load()).toHaveProperty("section.value", 1);
            expect(factory.load()).toHaveProperty("section.value", 2);

            expect(factory.load()).toHaveProperty("jwt", [
                { key: "key", value: "value" },
                { key: "key2", value: "value2" },
                { key: "key3", value: "value3" },
            ]);
        });

        it("customizing deep merge", () => {
            const factory = tomlProviderFactory({
                files: [
                    { path: path.join(FIXTURES_DIR, "base.toml"), required: true },
                    { path: path.join(FIXTURES_DIR, "section.toml"), required: true },
                ],
                deepMerge: {
                    customMerge: () => {
                        // always return original value
                        return a => a;
                    },
                },
            });

            expect(factory.load()).toHaveProperty("section.value", 1);
        });
    });
});
