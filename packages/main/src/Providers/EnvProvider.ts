import {Provider} from "../Provider";

export class EnvProvider<T> extends Provider<string> {
    constructor(private key: string,
                private envs: typeof process['env'] = process.env) {
        super();
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
        return this.envs[this.key]!;
    }
}
