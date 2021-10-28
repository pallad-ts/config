import {Config} from '../Config';
import {OptionalPromise} from '../utils';
import {runOnOptionalPromise} from './runOnOptionalPromise';
import {extractProvidersFromConfig} from './extractProvidersFromConfig';
import {replaceProvidersInConfig} from './replaceProvidersInConfig';
import {Provider} from '../Provider';
import {isPromise} from './isPromise';


export function loadConfig<T extends Config>(config: T): OptionalPromise<Config.Resolved<T>> {
    return runOnOptionalPromise(
        resolveProviders(extractProvidersFromConfig(config)),
        resolved => {
            const mapOfResolvedDependencies = new Map();
            for (const [dependency, value] of resolved) {
                mapOfResolvedDependencies.set(dependency, value);
            }
            return replaceProvidersInConfig(config, mapOfResolvedDependencies);
        }
    );
}

function resolveProviders(providers: Array<Provider<any>>) {
    const resolvedProviders: Array<[Provider<any>, any]> = [];

    const iterator = providers[Symbol.iterator]();
    for (const provider of iterator) {
        const value = provider.getValue();
        if (isPromise(value)) {
            return value.then(async value => {
                resolvedProviders.push([provider, value]);
                for (const provider of iterator) {
                    const value = await provider.getValue();
                    resolvedProviders.push([provider, value]);
                }
                return resolvedProviders;
            })
        }
        resolvedProviders.push([provider, value]);
    }
    return resolvedProviders;
}
