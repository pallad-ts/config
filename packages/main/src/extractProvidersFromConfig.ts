import * as is from "predicates";

import { Provider } from "./Provider";

/**
 * @internal
 */
export function* extractProvidersFromConfig(config: unknown): Generator<Provider<any>> {
    if (is.primitive(config)) {
        return;
    }

    if (Provider.isType(config)) {
        yield config;
    } else if (is.array(config)) {
        for (const value of config) {
            yield* extractProvidersFromConfig(value);
        }
    } else if (is.plainObject(config)) {
        for (const value of Object.values(config)) {
            yield* extractProvidersFromConfig(value);
        }
    }
}
