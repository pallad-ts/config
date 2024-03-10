import { Either, left, right } from "@sweet-monads/either";

import { Provider } from "@pallad/config";

import { ERRORS } from "../errors";

export async function extractConfigShapeAtPropertyPath(
    config: unknown,
    propertyPath: string
): Promise<Either<Error | Provider.Fail, unknown>> {
    let currentConfig = config;
    const currentPropertyPath = [];
    for (const part of propertyPath.split(".")) {
        currentPropertyPath.push(part);
        if (!isValidConfigValue(currentConfig)) {
            return left(ERRORS.INVALID_CONFIG_VALUE_AT_PATH.create(currentConfig, currentPropertyPath));
        }

        let newCurrentConfig = (currentConfig as any)[part];

        if (Provider.isType(newCurrentConfig)) {
            const resolvedProviderValue = await newCurrentConfig.getValue();

            if (resolvedProviderValue.isLeft()) {
                return left(resolvedProviderValue.value);
            }

            newCurrentConfig = resolvedProviderValue.value;
        }
        currentConfig = newCurrentConfig;
    }

    return right(currentConfig);
}

function isValidConfigValue(value: unknown): value is object | unknown[] {
    // eslint-disable-next-line no-null/no-null
    return value !== null && value !== undefined && typeof value !== "function";
}
