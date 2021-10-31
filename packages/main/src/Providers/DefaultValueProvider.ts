import {Provider} from "../Provider";
import {OptionalPromise} from '../utils';
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';
import {Validation} from 'monet';
import {ValueNotAvailable} from '../ValueNotAvailable';

/**
 * Wrapper for other provider. Returns default value if given provider has no available value.
 *
 * @public
 */
export class DefaultValueProvider<T, TOriginal> extends Provider<T | TOriginal> {
    constructor(private provider: Provider<TOriginal>, private defaultValue: T) {
        super();
    }

    getValue(): OptionalPromise<Provider.Value<T | TOriginal>> {
        return runOnOptionalPromise(
            this.provider.getValue(),
            result => result.catchMap(err => {
                if (ValueNotAvailable.is(err)) {
                    return Validation.Success<Provider.Fail, any>(this.defaultValue);
                }
                return Validation.Fail<Provider.Fail, any>(err);
            })
        )
    }

    static optionalWrap<T, TOriginal>(provider: Provider<TOriginal>, defaultValue?: T) {
        if (defaultValue !== undefined) {
            return new DefaultValueProvider<T, TOriginal>(provider, defaultValue);
        }
        return provider;
    }
}
