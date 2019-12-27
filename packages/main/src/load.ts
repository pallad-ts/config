import {getDependencies} from "./getDependencies";
import {Dependency} from "./Dependency";
import {Config} from "./Config";
import * as is from 'predicates';

export async function load<T extends Config>(config: T): Promise<Config.Resolved<T>> {
    const dependencies = getDependencies(config);

    const resolvedDependencies = await Promise.all(
        dependencies.map(async dependency => {
            return [dependency, await dependency.getValue()];
        })
    );

    const mapOfResolvedDependencies = new Map();
    for (const [dependency, value] of resolvedDependencies) {
        mapOfResolvedDependencies.set(dependency, value);
    }
    return replaceObject(config, mapOfResolvedDependencies);
}

function replaceObject<T extends object>(config: T, resolvedDependencies: Map<Dependency<any>, any>) {
    const newObject: any = is.array(config) ? [] : {};
    for (const key of Object.keys(config)) {
        const value = (config as any)[key];
        if (Dependency.is(value)) {
            newObject[key] = resolvedDependencies.get(value);
        } else if (is.object(value)) {
            newObject[key] = replaceObject(value, resolvedDependencies);
        } else {
            newObject[key] = value;
        }
    }
    return newObject as Config.Resolved<T>;
}