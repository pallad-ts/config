import { Provider } from "@src/Provider";
import { OptionalPromise } from "@src/utils";
import { ValueNotAvailable } from "@src/ValueNotAvailable";
import { left, right } from "@sweet-monads/either";

export class DummyProvider<T> extends Provider<T> {
    private options: DummyProvider.Options<T>;

    constructor(options: DummyProvider.Options.FromUser<T>) {
        super();
        this.options = {
            description: "DummyProvider",
            ...options,
        };
    }

    getValue(): OptionalPromise<Provider.Value<T>> {
        const value = (() => {
            if (this.options.error) {
                return left<Provider.Fail, T>(this.options.error);
            }

            if (this.options.value) {
                return right<Provider.Fail, T>(this.options.value);
            }

            return left<Provider.Fail, T>(new ValueNotAvailable(this.options.description));
        })();
        return this.options.isAsync ? Promise.resolve(value) : value;
    }

    static sync<T>(options: Omit<DummyProvider.Options.FromUser<T>, "isAsync">) {
        return new DummyProvider<T>({
            ...options,
            isAsync: false,
        });
    }

    static notAvailable<T>(options: Pick<DummyProvider.Options.FromUser<T>, "error" | "isAsync" | "description">) {
        return new DummyProvider(options);
    }

    static syncNotAvailable<T>() {
        return DummyProvider.sync<T>({});
    }

    static async<T>(options: Omit<DummyProvider.Options.FromUser<T>, "isAsync">) {
        return new DummyProvider<T>({
            ...options,
            isAsync: true,
        });
    }

    static asyncNotAvailable<T>() {
        return DummyProvider.async<T>({});
    }
}

export namespace DummyProvider {
    export interface Options<T> {
        value?: T;
        error?: Error | Error[];
        isAsync: boolean;
        description: string;
    }

    export namespace Options {
        export type FromUser<T> = Partial<Pick<Options<T>, "description">> &
            Omit<Options<T>, "isAvailable" | "description">;
    }
}
