import { Provider } from "./Provider";
import { FirstAvailableProvider } from "./Providers";

export function genericPresetFactory<T extends (...args: any[]) => Iterable<Provider<any>>>(providerFactory: T) {
    return (
        ...args: Parameters<T>
    ): FirstAvailableProvider<
        ReturnType<T> extends Iterable<infer TProvider extends Provider<any>> ? TProvider[] : never
    > => {
        return new FirstAvailableProvider(...providerFactory(...args));
    };
}


export namespace genericPresetFactory {
    export type InferProviderResult<T> = T extends Iterable<infer TProvider extends Provider<any>> ? TProvider[] : never
}
