import {OptionalPromise} from './utils';
import {Validation} from 'monet';
import {ValueNotAvailable} from './ValueNotAvailable';

/**
 * Describes config value retrievable from other sources (env, env file, external storage etc)
 *
 * @public
 */
export abstract class Provider<TType> {
    /**
     * Returns value of provider
     */
    abstract getValue(): OptionalPromise<Provider.Value<TType>>;

    /**
     * Checks if given value is a Provider
     */
    static is<T>(value: any): value is Provider<T> {
        return value instanceof Provider;
    }
}

export namespace Provider {
    export type Value<T> = Validation<Fail, T>;

    export type Fail = Fail.Entry | Fail.Entry[];
    export namespace Fail {
        export type Entry = ValueNotAvailable | Error;
    }
}
