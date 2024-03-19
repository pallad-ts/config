import { LoadedConfig } from "@src/types";
import { resolveConfigShape } from "@src/utils/resolveConfigShape";
import { Either } from "@sweet-monads/either";
import { Maybe } from "@sweet-monads/maybe";
import { AssertionError } from "node:assert";
import * as path from "node:path";

function assertConfigIsFound(config: Maybe<Either<Error, LoadedConfig>>): Either<Error, LoadedConfig> {
    if (config.isJust()) {
        return config.value;
    }

    throw new AssertionError({ message: "Config not found" });
}

function assertConfigHasNoErrors(config: Either<Error, LoadedConfig>): LoadedConfig {
    if (config.isRight()) {
        return config.value;
    }

    throw new AssertionError({ message: "Config has errors" });
}

describe("resolveConfig", () => {
    const FIXTURES_DIR = path.join(__dirname, "./fixtures");

    it.each([["object"], ["function"], ["async-function"], ["primitive"]])("resolving as %s", async type => {
        const result = await resolveConfigShape({
            directoryStartPath: path.join(FIXTURES_DIR, `config-as-${type}`),
        });

        const config = assertConfigHasNoErrors(assertConfigIsFound(result));

        expect(config.config).toMatchSnapshot();
    });

    it("loading config from file path", async () => {
        const result = await resolveConfigShape({
            filePath: path.join(FIXTURES_DIR, `custom-config-path/custom-config.ts`),
        });

        const config = assertConfigHasNoErrors(assertConfigIsFound(result));

        expect(config.config).toMatchSnapshot();
    });

    describe("fails", () => {
        it("if config is not found", async () => {
            const result = await resolveConfigShape({
                directoryStartPath: path.join(FIXTURES_DIR, `config-not-found`),
            });

            expect(result.isNone()).toBe(true);
        });

        it("if config returns a function", async () => {
            const result = await resolveConfigShape({
                directoryStartPath: path.join(FIXTURES_DIR, `invalid-config`),
            });

            expect(result.isJust()).toBe(true);
            expect(result.value!.value).toMatchSnapshot();
        });
    });
});
