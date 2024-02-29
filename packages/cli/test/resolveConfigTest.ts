import { LoadedConfig } from "@src/types";
import { resolveConfig } from "@src/utils/resolveConfig";
import { Either } from "@sweet-monads/either";
import { Maybe } from "@sweet-monads/maybe";
import { AssertionError } from "node:assert";
import * as path from "node:path";

import { ViolationsList } from "@pallad/violations";

function assertConfigIsFound(
    config: Maybe<Either<ViolationsList, LoadedConfig>>
): Either<ViolationsList, LoadedConfig> {
    if (config.isJust()) {
        return config.value;
    }

    throw new AssertionError({ message: "Config not found" });
}

function assertConfigHasNoErrors(config: Either<ViolationsList, LoadedConfig>): LoadedConfig {
    if (config.isRight()) {
        return config.value;
    }

    throw new AssertionError({ message: "Config has errors" });
}

describe("resolveConfig", () => {
    const FIXTURES_DIR = path.join(__dirname, "./fixtures");

    it.each([["object"], ["function"], ["async-function"]])("resolving as %s", async type => {
        const result = await resolveConfig({
            directoryStartPath: path.join(FIXTURES_DIR, `config-as-${type}`),
        });

        const config = assertConfigHasNoErrors(assertConfigIsFound(result));

        expect(config.config).toMatchSnapshot();
    });

    it("fails if config is not found", async () => {
        const result = await resolveConfig({
            directoryStartPath: path.join(FIXTURES_DIR, `config-not-found`),
        });

        expect(result.isNone()).toBe(true);
    });

    it("loading config from file path", async () => {
        const result = await resolveConfig({
            filePath: path.join(FIXTURES_DIR, `custom-config-path/custom-config.ts`),
        });

        const config = assertConfigHasNoErrors(assertConfigIsFound(result));

        expect(config.config).toMatchSnapshot();
    });
});
