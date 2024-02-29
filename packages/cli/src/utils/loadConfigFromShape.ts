import * as is from "predicates";

import { extractProvidersFromConfig, Provider, replaceProvidersInConfig } from "@pallad/config";

import { LoadedConfig } from "../types";

export async function loadConfigFromShape(configShape: unknown): Promise<LoadedConfig> {
    const map = new Map<Provider<any>, Provider.Value<any>>();
    if (is.primitive(configShape)) {
        return { config: configShape, providerMap: map };
    }
    const providers = Array.from(extractProvidersFromConfig(configShape));

    await Promise.all(
        providers.map(async provider => {
            const value = await provider.getValue();

            map.set(provider, value);
        })
    );

    return {
        config: replaceProvidersInConfig(configShape, map as any),
        providerMap: map,
    };
}
