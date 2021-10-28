import {Provider} from "../Provider";
import {OptionalPromise} from '../utils';
import {isPromise} from '../common/isPromise';
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';

/**
 * Wrapper for other provider. Returns default value if given provider has no available value.
 *
 * @public
 */
export class DefaultValueProvider<T, TOriginal> extends Provider<T | TOriginal> {
    constructor(private provider: Provider<TOriginal>, private defaultValue: T) {
        super();
    }

    getDescription(): string {
        return `${this.provider.getDescription()} - default: ${this.defaultValue}`;
    }

    isAvailable() {
        return true;
    }

    protected retrieveValue(): OptionalPromise<T | TOriginal> {
        return runOnOptionalPromise(
            this.provider.isAvailable(),
            isAvailable => {
                if (isAvailable) {
                    return this.provider.getValue() as any;
                }
                return this.defaultValue;
            }
        );
    }

    static optionalWrap<T, TOriginal>(provider: Provider<TOriginal>, defaultValue?: T) {
        if (defaultValue !== undefined) {
            return new DefaultValueProvider<T, TOriginal>(provider, defaultValue);
        }
        return provider;
    }
}
