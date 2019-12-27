import {TransformableDependency} from "@pallad/config";
import DataLoader = require("dataloader");

export class SSMDependency<T> extends TransformableDependency<T> {

    private cache?: Promise<SSMDependency.Value>;

    constructor(private key: string,
                transformer: TransformableDependency.Transformer<T> = TransformableDependency.identity,
                private dataLoader: DataLoader<string, SSMDependency.Value>) {
        super(transformer);
    }

    getDescription(): string {
        return `SSM (${this.key})`;
    }

    async isAvailable(): Promise<boolean> {
        return (await this.loadValue()) !== undefined;
    }

    private loadValue() {
        if (!this.cache) {
            this.cache = this.dataLoader.load(this.key);
        }
        return this.cache;
    }

    protected retrieveValue(): Promise<any> {
        return this.loadValue();
    }
}

export namespace SSMDependency {
    export type Value = string | string[] | undefined;
}