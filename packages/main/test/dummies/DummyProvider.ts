import {Provider} from "@src/Provider";

export class DummyProvider<T> extends Provider<T> {
    constructor(private options: {
        isAvailable: boolean;
        value: T,
        isAsync: boolean,
        description?: string,
    }) {
        super();
    }

    getDescription(): string {
        return this.options.description ?? 'DummyProvider';
    }

    isAvailable() {
        return this.options.isAsync ? Promise.resolve(this.options.isAvailable) : this.options.isAvailable;
    }

    protected retrieveValue() {
        return this.options.isAsync ? Promise.resolve(this.options.value) : this.options.value;
    }
}