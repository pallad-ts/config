import * as is from 'predicates';
import {Provider} from "../Provider";

export function extractProvidersFromConfig(config: object): Array<Provider<any>> {
    if (is.primitive(config)) {
        return [];
    }

    let deps: Array<Provider<any>> = [];

    if (Provider.is(config)) {
        deps.push(config);
    } else if (is.array(config)) {
        for (const value of config) {
            const extraDeps = extractProvidersFromConfig(value);
            if (extraDeps.length > 0) {
                deps = deps.concat(extraDeps);
            }
        }
    } else if (is.plainObject(config)) {
        for (const value of Object.values(config)) {
            const extraDeps = extractProvidersFromConfig(value);
            if (extraDeps.length > 0) {
                deps = deps.concat(extraDeps);
            }
        }
    }
    return deps;
}

