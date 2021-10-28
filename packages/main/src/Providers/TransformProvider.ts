import {Provider} from "../Provider";
import {OptionalPromise, UnwrapProvider} from "../utils";
import {isPromise} from "../common/isPromise";

export class TransformProvider<TType, TSource> extends Provider<TType> {
    constructor(private provider: Provider<TSource>,
                private transformer: TransformProvider.Transformer<TType, TSource>) {
        super();
    }

    getDescription(): string {
        return this.provider.getDescription();
    }

    isAvailable(): OptionalPromise<boolean> {
        return this.provider.isAvailable();
    }

    protected retrieveValue(): OptionalPromise<TType> {
        const value = this.provider.getValue();
        if (isPromise(value)) {
            return value.then(this.transformer);
        }
        return this.transformer(value);
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
