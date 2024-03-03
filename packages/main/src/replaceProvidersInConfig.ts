import { Either } from "@sweet-monads/either";
import * as is from "predicates";

import { Provider } from "./Provider";
import { ResolvedConfig } from "./ResolvedConfig";

/**
 * @internal
 */
export function replaceProvidersInConfig<T>(
    config: T,
    resolvedDependencies: Map<Provider<unknown>, Either<Provider.Fail, unknown>>
): ResolvedConfig<T> {
    if (is.primitive(config)) {
        return config as any as ResolvedConfig<T>;
    } else if (Provider.isType(config)) {
        return resolvedDependencies.get(config)!.value as ResolvedConfig<T>;
    } else if (is.array(config)) {
        const newObject = [];
        for (const value of config) {
            newObject.push(replaceProvidersInConfig(value, resolvedDependencies));
        }
        return newObject as any as ResolvedConfig<T>;
    } else if (is.plainObject(config)) {
        const newObject: Record<any, any> = {};
        for (const [key, value] of Object.entries(config)) {
            newObject[key] = replaceProvidersInConfig(value, resolvedDependencies);
        }
        return newObject as ResolvedConfig<T>;
    }
    return config as ResolvedConfig<T>;
}
