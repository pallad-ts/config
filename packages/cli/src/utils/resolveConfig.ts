import { Either } from "@sweet-monads/either";

import { LoadedConfig } from "../types";
import { loadConfigFromShape } from "./loadConfigFromShape";
import { resolveConfigShape } from "./resolveConfigShape";

export async function resolveConfig(options: resolveConfigShape.Options): Promise<Either<Error, LoadedConfig>> {
    return (await resolveConfigShape(options)).asyncMap(configShape => {
        return loadConfigFromShape(configShape);
    });
}
