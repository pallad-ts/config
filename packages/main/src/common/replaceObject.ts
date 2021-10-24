import {Provider} from "../Provider";
import * as is from "predicates";
import {Config} from "../Config";

export function replaceObject<T extends Config>(config: T, resolvedDependencies: Map<Provider<any>, any>) {
    const newObject: any = is.array(config) ? [] : {};
    for (const key of Object.keys(config)) {
        const value = (config as any)[key];
        if (Provider.is(value)) {
            newObject[key] = resolvedDependencies.get(value);
        } else if (is.object(value)) {
            newObject[key] = replaceObject(value, resolvedDependencies);
        } else {
            newObject[key] = value;
        }
    }
    return newObject as Config.Resolved<T>;
}