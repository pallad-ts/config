import {Dependency} from "../Dependency";
import * as is from 'predicates';

export abstract class TransformableDependency<TType> extends Dependency<TType> {
    protected constructor(protected transformer: TransformableDependency.Transformer<TType> = TransformableDependency.identity) {
        super();
    }

    async getValue(): Promise<TType> {
        const value = super.getValue();
        if (is.promiseLike(value)) {
            return value.then(this.transformer);
        }
        return this.transformer(value);
    }
}

export namespace TransformableDependency {
    export function identity<T>(x: T) {
        return x;
    }

    export type Transformer<T> = (x: any) => T;
}
