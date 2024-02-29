import { Either, fromTry, right } from "@sweet-monads/either";

import { protect, Secret, secret } from "@pallad/secret";
import { TypeCheck } from "@pallad/type-check";

import { ValueNotAvailable } from "./ValueNotAvailable";
import { runOnOptionalPromise } from "./common/runOnOptionalPromise";
import { OptionalPromise } from "./utils";

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

    transform<TNewType>(transformer: (value: TType) => TNewType): TransformProvider<TNewType, TType> {
        return new TransformProvider(this, transformer);
    }

    optional() {
        return this.defaultTo(undefined);
    }

    secret(): TransformProvider<Secret<TType>, TType> {
        return new TransformProvider(this, value => secret(value));
    }

    defaultTo<TNewType>(defaultValue: TNewType): DefaultValueProvider<TNewType, TType> {
        return new DefaultValueProvider(this, defaultValue);
    }
}

export namespace Provider {
    export type Value<T> = Either<Fail, T>;

    export type Fail = Fail.Entry | Fail.Entry[];
    export namespace Fail {
        export type Entry = ValueNotAvailable | Error;
    }
}

/**
 * Wrapper for other provider. Returns default value if given provider has no available value.
 *
 * @public
 */
export class DefaultValueProvider<T, TOriginal> extends Provider<T | TOriginal> {
    constructor(
        private provider: Provider<TOriginal>,
        private defaultValue: T
    ) {
        super();
    }

    getValue(): OptionalPromise<Provider.Value<T | TOriginal>> {
        return runOnOptionalPromise(this.provider.getValue(), result => {
            if (result.isLeft() && ValueNotAvailable.isType(result.value)) {
                return right<Provider.Fail, any>(this.defaultValue);
            }

            return result;
        });
    }
}

export class TransformProvider<TType, TSource> extends Provider<TType> {
    constructor(
        private provider: Provider<TSource>,
        private transformer: TransformProvider.Transformer<TType, TSource>
    ) {
        super();
    }

    getValue(): OptionalPromise<Provider.Value<TType>> {
        return runOnOptionalPromise(this.provider.getValue(), value => {
            return value.chain(value => {
                return fromTry(() => this.transformer(value));
            });
        });
    }
}

export namespace TransformProvider {
    export type Transformer<T, TSource = unknown> = (x: TSource, ...args: any[]) => T;
}
