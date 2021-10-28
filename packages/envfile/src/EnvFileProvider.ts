import {Provider} from "@pallad/config";

export class EnvFileProvider extends Provider<string> {
    constructor(private key: string,
                private envFileVars: Record<string, string>) {
        super();
    }

    getDescription() {
        return `"${this.key}" from ENV file`;
    }

    isAvailable() {
        if (this.key in this.envFileVars) {
            return this.envFileVars[this.key] !== '';
        }
        return false;
    }

    protected retrieveValue() {
        return this.envFileVars[this.key];
    }
}
