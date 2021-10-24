import {extractProvidersFromConfig} from "./common/extractProvidersFromConfig";
import {Config} from "./Config";
import {replaceObject} from "./common/replaceObject";

export async function load<T extends Config>(config: T): Promise<Config.Resolved<T>> {
    const dependencies = extractProvidersFromConfig(config);

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

