import * as is from 'predicates';
import {Dependency} from "./Dependency";

export function getDependencies(config: object): Array<Dependency<any>> {
    if (config === null || config === undefined) {
        return [];
    }

    if (!is.object(config)) {
        return [];
    }

    let deps: Array<Dependency<any>> = [];
    for (const key of Object.keys(config)) {
        const value: any = (config as any)[key];
        if (value instanceof Dependency) {
            deps.push(value);
        } else if (is.object(value)) {
            const extraDeps = getDependencies(value);
            if (extraDeps.length > 0) {
                deps = deps.concat(extraDeps);
            }
        }
    }
    return deps;
}

