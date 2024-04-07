import * as is from "predicates";

import { Provider } from "./Provider";

/**
 * @internal
 */
export function replaceProvidersInConfig(
    config: unknown,
    resolvedDependencies: Map<Provider<unknown>, Provider.Value<unknown>>,
    transformValue: (value: Provider.Value<unknown>) => unknown
): unknown {
    if (is.primitive(config)) {
        return config;
    } else if (Provider.isType(config)) {
        return transformValue(resolvedDependencies.get(config)!);
    } else if (is.array(config)) {
        const newObject = [];
        for (const value of config) {
            newObject.push(replaceProvidersInConfig(value, resolvedDependencies, transformValue));
        }
        return newObject;
    } else if (is.plainObject(config)) {
        const newObject: Record<any, any> = {};
        for (const [key, value] of Object.entries(config)) {
            newObject[key] = replaceProvidersInConfig(value, resolvedDependencies, transformValue);
        }
        return newObject;
    }
    return config;
}
