import { Either, left, right } from "@sweet-monads/either";

import { Provider } from "../Provider";
import { ResolvedConfig } from "../ResolvedConfig";
import { extractProvidersFromConfig } from "../extractProvidersFromConfig";
import { replaceProvidersInConfig } from "../replaceProvidersInConfig";
import { OptionalPromise } from "../utils";
import { isPromise } from "./isPromise";
import { runOnOptionalPromise } from "./runOnOptionalPromise";

/**
 * @internal
 */
export function loadConfig<T>(config: T): OptionalPromise<Either<Provider.Fail[], ResolvedConfig<T>>> {
    return runOnOptionalPromise(resolveProviders(Array.from(extractProvidersFromConfig(config))), resolved => {
        if (resolved.size === 0) {
            return right<Provider.Fail[], ResolvedConfig<T>>(config as any);
        }

        const fails = Array.from(resolved.values()).reduce((result, entry) => {
            if (entry.isLeft()) {
                const fail = entry.value;
                return result.concat(Array.isArray(fail) ? fail : [fail]);
            }
            return result;
        }, [] as Provider.Fail[]);

        if (fails.length) {
            return left(fails);
        }
        return right(replaceProvidersInConfig(config, resolved));
    });
}

function resolveProviders(providers: Array<Provider<any>>) {
    const resolvedProviders: Map<Provider<any>, Provider.Value<any>> = new Map();

    const resolvedValues = providers.map(provider => {
        return runOnOptionalPromise(provider.getValue(), value => {
            return [provider, value];
        });
    });
    const hasPromise = resolvedValues.some(isPromise);

    return runOnOptionalPromise<Array<[Provider<any>, Provider.Value<any>]>, typeof resolvedProviders>(
        hasPromise ? (Promise.all(resolvedValues) as any) : resolvedValues,
        values => {
            for (const [provider, value] of values) {
                resolvedProviders.set(provider, value);
            }
            return resolvedProviders;
        }
    );
}
