import {Dependency} from "../Dependency";

export abstract class TransformableDependency<TType> extends Dependency<TType> {
    protected constructor(protected transformer: TransformableDependency.Transformer<TType> = TransformableDependency.identity) {
        super();
    }

    protected abstract retrieveValue(): Promise<any>;

    abstract getDescription(): string;

    abstract isAvailable(): Promise<boolean>;

    async getValue(): Promise<TType> {
        return this.transformer(await super.getValue());
    }
}

export namespace TransformableDependency {
    export function identity(x: any) {
        return x;
    }

    export type Transformer<T> = (x: any) => T;
}