import {Provider} from '@pallad/config';
import {DataLoader} from './index';

export class SSMProvider extends Provider<string | string[]> {

    private cache?: Promise<SSMProvider.Value | undefined>;

    constructor(private key: string,
                private dataLoader: DataLoader<string, SSMProvider.Value | undefined>) {
        super()
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

export namespace SSMProvider {
    export type Value = string | string[];
}
