import * as is from 'predicates';
import {Provider} from "../Provider";

export function extractProvidersFromConfig(config: object): Array<Provider<any>> {
    if (config === null || config === undefined) {
        return [];
    }

    if (!is.object(config)) {
        return [];
    }

    let deps: Array<Provider<any>> = [];
    for (const key of Object.keys(config)) {
        const value: any = (config as any)[key];
        if (value instanceof Provider) {
            deps.push(value);
        } else if (is.object(value)) {
            const extraDeps = extractProvidersFromConfig(value);
            if (extraDeps.length > 0) {
                deps = deps.concat(extraDeps);
            }
        }
    }
    return deps;
}

