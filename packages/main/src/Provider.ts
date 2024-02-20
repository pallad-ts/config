import { OptionalPromise } from "./utils";
import { ValueNotAvailable } from "./ValueNotAvailable";
import { Either } from "@sweet-monads/either";
import { TypeCheck } from "@pallad/type-check";

const CHECK = new TypeCheck("@pallad/config/Provider");

/**
 * Describes config value retrievable from other sources (env, env file, external storage etc)
 *
 * @public
 */
export abstract class Provider<TType> {
    constructor() {
        CHECK.assign(this);
    }

    /**
     * Returns value of provider
     */
    abstract getValue(): OptionalPromise<Provider.Value<TType>>;

    /**
     * Checks if given value is a Provider
     */
    static isType<T>(value: unknown): value is Provider<T> {
        return CHECK.isType(value);
    }
}

export namespace Provider {
    export type Value<T> = Either<Fail, T>;

    export type Fail = Fail.Entry | Fail.Entry[];
    export namespace Fail {
        export type Entry = ValueNotAvailable | Error;
    }
}
