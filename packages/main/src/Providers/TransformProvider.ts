import {Provider} from "../Provider";
import {OptionalPromise} from "../utils";
import {isPromise} from "../common/isPromise";

export class TransformProvider<TType, TSource> extends Provider<TType> {
    constructor(private dependency: Provider<TSource>,
                private transformer: TransformProvider.Transformer<TType, TSource>) {
        super();
    }

    getDescription(): string {
        return this.dependency.getDescription();
    }

    isAvailable(): OptionalPromise<boolean> {
        return this.dependency.isAvailable();
    }

    protected retrieveValue(): OptionalPromise<TType> {
        const value = this.dependency.getValue();
        if (isPromise(value)) {
            return value.then(this.transformer);
        }
        return this.transformer(value);
    }

    static optionalWrap<TSource extends Provider<any>, TType>(dependency: TSource,
                                                              transformer?: TransformProvider.Transformer<any, any>) {
        if (transformer) {
            return new TransformProvider(dependency, transformer);
        }
        return dependency;
    }
}

export namespace TransformProvider {
    export type Transformer<T, TSource = unknown> = (x: TSource) => T;
}