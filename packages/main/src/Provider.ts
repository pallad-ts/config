import {OptionalPromise} from './utils';
import * as is from 'predicates';
import {ERRORS} from "./errors";
import {isPromise} from "./common/isPromise";

/**
 * Describes config value retrievable from other sources (env, env file, external storage etc)
 *
 * @public
 */
export abstract class Provider<TType> {
    protected abstract retrieveValue(): OptionalPromise<TType>;

    /**
     * Describes provider like "ENV variable TEST"
     */
    abstract getDescription(): string;

    /**
     * Checks if value for provider is available
     */
    abstract isAvailable(): OptionalPromise<boolean>;

    /**
     * Returns value of provider. Throws an error if it is not available
     */
    getValue(): OptionalPromise<TType> {
        const isAvailable = this.assertAvailable();
        if (is.promiseLike(isAvailable)) {
            return isAvailable.then(() => {
                return this.retrieveValue();
            })
        }
        return this.retrieveValue();
    }

    private assertAvailable() {
        const isAvailable = this.isAvailable();
        if (isPromise(isAvailable)) {
            return isAvailable.then(result => {
                if (!result) {
                    throw ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(this.getDescription());
                }
            })
        } else if (!isAvailable) {
            throw ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(this.getDescription());
        }
    }

    /**
     * Checks if given value is a Provider
     * @param value
     */
    static is<T>(value: any): value is Provider<T> {
        return value instanceof Provider;
    }
}
