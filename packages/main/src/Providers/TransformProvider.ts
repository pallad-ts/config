import {Provider} from "../Provider";
import {OptionalPromise, UnwrapProvider} from "../utils";
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';
import {Either} from 'monet';

export class TransformProvider<TType, TSource> extends Provider<TType> {
    constructor(private provider: Provider<TSource>,
                private transformer: TransformProvider.Transformer<TType, TSource>) {
        super();
    }

    getValue(): OptionalPromise<Provider.Value<TType>> {
        return runOnOptionalPromise(
            this.provider.getValue(),
            value => {
                return value.flatMap(value => {
                    return Either.fromTry(() => this.transformer(value))
                        .toValidation();
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
    export type Transformer<T, TSource = unknown> = (x: TSource) => T;
}
