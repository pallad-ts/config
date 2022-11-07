import {Provider} from "../Provider";
import {OptionalPromise} from '../utils';
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';
import {ValueNotAvailable} from '../ValueNotAvailable';
import {left, right} from "@sweet-monads/either";

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
            result => {
                if (result.isLeft() && ValueNotAvailable.is(result.value)) {
                    return right<Provider.Fail, any>(this.defaultValue);
                }

                return result;

            }
        );
    }

    static optionalWrap<T, TOriginal>(...args: [Provider<TOriginal>] | [Provider<TOriginal>, T]) {
        if (args.length === 2) {
            return new DefaultValueProvider<T, TOriginal>(args[0], args[1]);
        }
        return args[0];
    }
}
