import { left } from "@sweet-monads/either";

import { Provider } from "../Provider";
import { ValueNotAvailable } from "../ValueNotAvailable";
import { isPromise } from "../common/isPromise";
import { OptionalPromise } from "../utils";

export class FirstAvailableProvider<T extends Array<Provider<any>>> extends Provider<FirstAvailableProvider.Unwrap<T>> {
    readonly providers: Array<Provider<T>>;

    constructor(...providers: T) {
        super();
        this.providers = providers;
        Object.freeze(this.providers);
    }

    getValue(): OptionalPromise<Provider.Value<FirstAvailableProvider.Unwrap<T>>> {
        // This piece of code is pretty complex since it needs to ensure to resolve value in sync way if all of providers are sync
        // if any of the providers is async then the resolution should by async as well
        // it is not an easy task to achieve it without using async/await therefore the code is a bit complex
        // I've tried to optimize it once and I've failed
        // increase counter below to warn anybody else who tries to optimize it
        // total_wasted_hours_to_improve_it = 2
        const iterator = this.providers[Symbol.iterator]();
        const descriptions: string[] = [];
        for (const provider of iterator) {
            const value = provider.getValue();
            if (isPromise(value)) {
                return value.then(x => {
                    if (x.isLeft() && ValueNotAvailable.isType(x.value)) {
                        descriptions.push((x.value as ValueNotAvailable).description);
                        return (async () => {
                            for (const provider of iterator) {
                                const value = await provider.getValue();
                                if (value.isLeft() && ValueNotAvailable.isType(value.value)) {
                                    descriptions.push((value.value as ValueNotAvailable).description);
                                    continue;
                                }
                                return value as Provider.Value<FirstAvailableProvider.Unwrap<T>>;
                            }

                            return left(
                                new ValueNotAvailable(`First available: ${descriptions.join(", ")}`)
                            ) as Provider.Value<FirstAvailableProvider.Unwrap<T>>;
                        })();
                    }
                    return x as Provider.Value<FirstAvailableProvider.Unwrap<T>>;
                });
            } else if (value.isLeft() && ValueNotAvailable.isType(value.value)) {
                descriptions.push((value.value as ValueNotAvailable).description);
                continue;
            }
            return value as Provider.Value<FirstAvailableProvider.Unwrap<T>>;
        }

        return left(new ValueNotAvailable(`First available: ${descriptions.join(", ")}`));
    }
}

export namespace FirstAvailableProvider {
    export type Unwrap<T> = T extends Array<infer U> ? (U extends Provider<infer TU> ? TU : never) : never;
}
