import {OptionalPromise} from './utils';
import {Validation} from 'monet';
import {ValueNotAvailable} from './ValueNotAvailable';
import * as is from 'predicates';

const TYPE = '@pallad/config/Provider';
const TYPE_KEY = '@type';

const IS_TYPE = is.property(TYPE_KEY, is.strictEqualTo(TYPE));

/**
 * Describes config value retrievable from other sources (env, env file, external storage etc)
 *
 * @public
 */
export abstract class Provider<TType> {
    constructor() {
        Object.defineProperty(this, TYPE_KEY, {
            value: TYPE,
            enumerable: false,
            configurable: false
        });
    }

    /**
     * Returns value of provider
     */
    abstract getValue(): OptionalPromise<Provider.Value<TType>>;

    /**
     * Checks if given value is a Provider
     */
    static is<T>(value: any): value is Provider<T> {
        return value instanceof Provider || IS_TYPE(value);
    }
}

export namespace Provider {
    export type Value<T> = Validation<Fail, T>;

    export type Fail = Fail.Entry | Fail.Entry[];
    export namespace Fail {
        export type Entry = ValueNotAvailable | Error;
    }
}
