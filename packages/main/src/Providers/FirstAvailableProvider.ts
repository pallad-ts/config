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
