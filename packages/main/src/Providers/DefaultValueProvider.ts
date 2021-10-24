import {Provider} from "../Provider";
import {OptionalPromise} from '../utils';
import {isPromise} from "../common/isPromise";

/**
 * Wrapper for other provider. Returns default value if given provider has no available value.
 *
 * @public
 */
export class DefaultValueProvider<T, TOriginal> extends Provider<T | TOriginal> {
    constructor(private dependency: Provider<TOriginal>, private defaultValue: T) {
        super();
    }

    getDescription(): string {
        return `${this.dependency.getDescription()} - default: ${this.defaultValue}`;
    }

    isAvailable() {
        return true;
    }

    protected retrieveValue(): OptionalPromise<T | TOriginal> {
        const isAvailable = this.dependency.isAvailable();

        if (isPromise(isAvailable)) {
            return isAvailable.then(result => {
                if (result) {
                    return this.dependency.getValue();
                }
                return this.defaultValue;
            })
        }

        if (isAvailable) {
            return this.dependency.getValue();
        }
        return this.defaultValue;
    }

    static optionalWrap<T, TOriginal>(provider: Provider<TOriginal>, defaultValue?: T) {
        if (defaultValue !== undefined) {
            return new DefaultValueProvider<T, TOriginal>(provider, defaultValue);
        }
        return provider;
    }
}
