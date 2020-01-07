import {TransformableDependency} from "@pallad/config";
import {EnvFileLoader} from "./EnvFileLoader";

export class EnvFileDependency<T> extends TransformableDependency<T> {
    constructor(private key: string,
                transformer: TransformableDependency.Transformer<T> = TransformableDependency.identity,
                private envFileLoader: EnvFileLoader) {
        super(transformer);
    }

    getDescription(): string {
        return `"${this.key}" from ENV file`;
    }

    async isAvailable(): Promise<boolean> {
        const config = await this.envFileLoader.load();
        if (this.key in config) {
            return config[this.key] !== '';
        }
        return false;
    }

    protected async retrieveValue(): Promise<any> {
        const config = await this.envFileLoader.load();
        return config[this.key];
    }
}