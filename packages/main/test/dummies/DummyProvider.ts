import {Provider} from "@src/Provider";

export class DummyProvider<T> extends Provider<T> {
    private options: DummyProvider.Options<T>;

    constructor(options: DummyProvider.Options.FromUser<T>) {
        super();
        this.options = {
            isAvailable: true,
            description: 'DummyProvider',
            ...options
        }
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

    static sync<T>(options: Omit<DummyProvider.Options.FromUser<T>, 'isAsync'>) {
        return new DummyProvider<T>({
            ...options,
            isAsync: false
        })
    }

    static syncNotAvailable<T>() {
        return DummyProvider.sync<T>({value: 'test' as any, isAvailable: false});
    }

    static async<T>(options: Omit<DummyProvider.Options.FromUser<T>, 'isAsync'>) {
        return new DummyProvider<T>({
            ...options,
            isAsync: true
        });
    }

    static asyncNotAvailable<T>() {
        return DummyProvider.async<T>({value: 'test' as any, isAvailable: false});
    }
}

export namespace DummyProvider {
    export interface Options<T> {
        isAvailable: boolean;
        value: T,
        isAsync: boolean,
        description: string,
    }

    export namespace Options {
        export type FromUser<T> = Partial<Pick<Options<T>, 'isAvailable' | 'description'>> & Omit<Options<T>, 'isAvailable' | 'description'>;
    }
}
