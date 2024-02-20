import { Provider } from "../Provider";

export abstract class AsyncProvider<T> extends Provider<T> {
    private cache?: Promise<Provider.Value<T>>;

    getValue() {
        if (!this.cache) {
            this.cache = this.resolveValueAsync();
        }
        return this.cache;
    }

    abstract resolveValueAsync(): Promise<Provider.Value<T>>;
}
