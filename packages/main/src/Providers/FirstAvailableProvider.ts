import {Provider} from "../Provider";
import {isPromise} from '../common/isPromise';
import {OptionalPromise} from '../utils';
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';

export class FirstAvailableProvider<T extends Array<Provider<any>>> extends Provider<FirstAvailableProvider.Unwrap<T>> {
    private providers: Array<Provider<T>>;

    constructor(...providers: T) {
        super();
        this.providers = providers;
    }

    isAvailable() {
        return runOnOptionalPromise(this.getFirstAvailableProvider(), provider => !!provider);
    }

    private getFirstAvailableProvider(): OptionalPromise<Provider<any> | undefined> {
        const iterator = this.providers[Symbol.iterator]();
        for (const provider of iterator) {
            const isAvailable = provider.isAvailable();
            if (isPromise(isAvailable)) {
                return isAvailable.then(x => {
                    if (x) {
                        return provider;
                    }
                    return (async () => {
                        for (const provider of iterator) {
                            const isAvailable = await provider.isAvailable();
                            if (isAvailable) {
                                return provider;
                            }
                        }
                    })();
                });
            } else if (isAvailable) {
                return provider;
            }
        }
    }

    getDescription(): string {
        const desc = this.providers.map(x => x.getDescription()).join(', ');
        return `First available - ${desc}`;
    }

    retrieveValue() {
        return runOnOptionalPromise(
            this.getFirstAvailableProvider(),
            provider => {
                return provider!.getValue()
            }
        );
    }
}

export namespace FirstAvailableProvider {
    export type Unwrap<T> = T extends Array<Provider<infer U>> ? U : T;
}
