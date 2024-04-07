import { LoadedConfig } from "@src/types";
import { resolveConfig } from "@src/utils/resolveConfig";
import { Either } from "@sweet-monads/either";
import { AssertionError } from "node:assert";
import * as path from "node:path";

function assertConfigHasNoErrors(config: Either<Error, LoadedConfig>): LoadedConfig {
    console.log(config);
    if (config.isRight()) {
        return config.value;
    }

    throw new AssertionError({ message: "Config has errors" });
}

describe("resolveConfig", () => {
    const FIXTURES_DIR = path.join(__dirname, "./fixtures");

    it.each([["object"], ["function"], ["async-function"], ["primitive"]])("resolving as %s", async type => {
        const result = await resolveConfig({
            filePath: path.resolve(FIXTURES_DIR, `config-as-${type}.ts`),
        });

        const config = assertConfigHasNoErrors(result);

        expect(config.config).toMatchSnapshot();
    });

    it("using moduleConfigProperty", async () => {
        const result = await resolveConfig({
            filePath: path.resolve(FIXTURES_DIR, `custom-config.ts`),
            moduleConfigProperty: "anotherProperty",
        });

        const config = assertConfigHasNoErrors(result);

        expect(config.config).toMatchSnapshot();
    });

    describe("loading common js", () => {
        it("default export", async () => {
            const result = await resolveConfig({
                filePath: path.resolve(FIXTURES_DIR, `cjs-default-export.js`),
            });

            const config = assertConfigHasNoErrors(result);

            expect(config.config).toMatchSnapshot();
        });

        it("with custom property", async () => {
            const result = await resolveConfig({
                filePath: path.resolve(FIXTURES_DIR, `cjs-custom-property.js`),
                moduleConfigProperty: "foo",
            });

            const config = assertConfigHasNoErrors(result);

            expect(config.config).toMatchSnapshot();
        });
    });

    describe("fails", () => {
        it("if config returns a function", async () => {
            const result = await resolveConfig({
                filePath: path.join(FIXTURES_DIR, `invalid-config.ts`),
            });

            expect(result.value).toMatchSnapshot();
        });
    });
});
