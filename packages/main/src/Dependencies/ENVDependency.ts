import {TransformableDependency} from "./TransformableDependency";

export class ENVDependency<T> extends TransformableDependency<T> {
    constructor(private key: string,
                transformer: TransformableDependency.Transformer<T> = TransformableDependency.identity,
                private envs: typeof process['env'] = process.env) {
        super(transformer);
    }

    getDescription(): string {
        return 'ENV: ' + this.key;
    }

    async isAvailable() {
        if (this.key in this.envs) {
            return this.envs[this.key] !== '';
        }
        return false;
    }

    protected async retrieveValue() {
        return this.envs[this.key];
    }
}
