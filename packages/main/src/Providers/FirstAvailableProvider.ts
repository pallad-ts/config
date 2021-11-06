import {Provider} from "../Provider";
import {isPromise} from '../common/isPromise';
import {OptionalPromise} from '../utils';
import {Validation} from 'monet';
import {ValueNotAvailable} from '../ValueNotAvailable';

export class FirstAvailableProvider<T extends Array<Provider<any>>> extends Provider<FirstAvailableProvider.Unwrap<T>> {
    private providers: Array<Provider<T>>;

    constructor(...providers: T) {
        super();
        this.providers = providers;
    }

    getValue(): OptionalPromise<Provider.Value<FirstAvailableProvider.Unwrap<T>>> {
        const iterator = this.providers[Symbol.iterator]();
        const descriptions: string[] = [];
        for (const provider of iterator) {
            const value = provider.getValue();
            if (isPromise(value)) {
                return value.then(x => {
                    if (x.isFail() && ValueNotAvailable.is(x.fail())) {
                        descriptions.push((x.fail() as ValueNotAvailable).description);
                        return (async () => {
                            for (const provider of iterator) {
                                const value = await provider.getValue();
                                if (value.isFail() && ValueNotAvailable.is(value.fail())) {
                                    descriptions.push((value.fail() as ValueNotAvailable).description);
                                    continue;
                                }
                                return value as Provider.Value<FirstAvailableProvider.Unwrap<T>>;
                            }

                            return Validation.Fail(
                                new ValueNotAvailable(`First available: ${descriptions.join(', ')}`)
                            ) as Provider.Value<FirstAvailableProvider.Unwrap<T>>
                        })();
                    }
                    return x as Provider.Value<FirstAvailableProvider.Unwrap<T>>;
                });
            } else if (value.isFail() && ValueNotAvailable.is(value.fail())) {
                descriptions.push((value.fail() as ValueNotAvailable).description);
                continue;
            }
            return value as Provider.Value<FirstAvailableProvider.Unwrap<T>>;
        }

        return Validation.Fail(
            new ValueNotAvailable(`First available: ${descriptions.join(', ')}`)
        );
    }
}

export namespace FirstAvailableProvider {
    export type Unwrap<T> = T extends Array<Provider<infer U>> ? U : T;
}
