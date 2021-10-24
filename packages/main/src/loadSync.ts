import {Config} from "./Config";
import {extractProvidersFromConfig} from "./common/extractProvidersFromConfig";
import {replaceObject} from "./common/replaceObject";
import * as is from 'predicates'
import {Provider} from "./Provider";
import {ConfigError} from "./ConfigError";

export function loadSync<T extends Config>(config: T): Config.Resolved<T> {
    const dependencies = extractProvidersFromConfig(config);

    const resolvedDependencies = new Map<Provider<any>, any>();

    for (const dependency of dependencies) {
        const value = dependency.getValue();
        if (is.promiseLike(value)) {
            const msg = `Cannot load config synchronously since provider "${dependency.getDescription()}" is asynchronous (returns Promise).`;
            throw new ConfigError(msg);
        }
    }
    dependencies.map(dependency => {
        return [dependency, dependency.getValue()];
    });


    const mapOfResolvedDependencies = new Map();
    for (const [dependency, value] of resolvedDependencies) {
        mapOfResolvedDependencies.set(dependency, value);
    }
    return replaceObject(config, mapOfResolvedDependencies);
}