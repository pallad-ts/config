import {Provider} from "../Provider";
import * as is from "predicates";
import {Config} from "../Config";

export function replaceProvidersInConfig<T>(config: T, resolvedDependencies: Map<Provider<any>, any>): Config.Resolved<T> {
    if (is.primitive(config)) {
        return config as any as Config.Resolved<T>;
    } else if (Provider.is(config)) {
        return resolvedDependencies.get(config);
    } else if (is.array(config)) {
        const newObject = [];
        for (const value of config) {
            newObject.push(replaceProvidersInConfig(value, resolvedDependencies));
        }
        return newObject as any as Config.Resolved<T>;
    } else if (is.plainObject(config)) {
        const newObject: Record<any, any> = {};
        for (const [key, value] of Object.entries(config)) {
            newObject[key] = replaceProvidersInConfig(value, resolvedDependencies);
        }
        return newObject as Config.Resolved<T>;
    }
    return config;
}
