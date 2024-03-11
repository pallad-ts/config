import { Either } from "@sweet-monads/either";

import { Provider } from "@pallad/config";

export interface LoadedConfig {
    config: unknown;
    providerMap: Map<Provider<unknown>, Provider.Value<unknown>>;
}
