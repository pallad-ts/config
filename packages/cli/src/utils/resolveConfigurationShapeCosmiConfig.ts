import { Either, left, right } from "@sweet-monads/either";
import { fromNullable, Maybe } from "@sweet-monads/maybe";
import { PublicExplorer as CosmiConfigPublicExplorer } from "cosmiconfig";
import * as is from "predicates";

import { ViolationsList } from "@pallad/violations";

export async function resolveConfigurationShapeCosmiConfig(
    explorer: CosmiConfigPublicExplorer,
    { filePath, directoryStartPath }: resolveConfigurationShapeCosmiConfig.Options
): Promise<Maybe<Either<ViolationsList, unknown>>> {
    const result = await (filePath ? explorer.load(filePath) : explorer.search(directoryStartPath));

    return fromNullable(result?.config).asyncMap(validateConfig);
}

async function validateConfig(config: unknown): Promise<Either<ViolationsList, unknown>> {
    if (config instanceof Function) {
        return validateConfigShape(await config());
    }

    return validateConfigShape(config);
}

function validateConfigShape(shape: unknown): Either<ViolationsList, unknown> {
    if (is.function(shape)) {
        left(
            new ViolationsList().addViolation(
                "Configuration shape must be an object, primitive or array. Got " + typeof shape
            )
        );
    }

    return right(shape);
}

export namespace resolveConfigurationShapeCosmiConfig {
    export interface Options {
        filePath?: string;
        directoryStartPath?: string;
    }
}
