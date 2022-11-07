import {Provider} from "../Provider";
import {OptionalPromise, UnwrapProvider} from "../utils";
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';
import {fromTry} from "../common/fromTry";

export class TransformProvider<TType, TSource> extends Provider<TType> {
    constructor(private provider: Provider<TSource>,
                private transformer: TransformProvider.Transformer<TType, TSource>) {
        super();
    }

    getValue(): OptionalPromise<Provider.Value<TType>> {
        return runOnOptionalPromise(
            this.provider.getValue(),
            value => {
                return value.chain(value => {
                    return fromTry(() => this.transformer(value))
                })
            }
        )
    }

    static optionalWrap<TType, TProvider extends Provider<any>>(
        provider: TProvider,
        transformer?: TransformProvider.Transformer<TType, UnwrapProvider<TProvider>>
    ): TransformProvider<TType, UnwrapProvider<TProvider>> | TProvider {
        if (transformer) {
            return new TransformProvider(provider, transformer);
        }
        return provider;
    }
}

export namespace TransformProvider {
    export type Transformer<T, TSource = unknown> = (x: TSource, ...args: any[]) => T;
}
