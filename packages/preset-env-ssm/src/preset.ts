import { FirstAvailableProvider, Provider } from "@pallad/config";
import { envProviderFactory } from "@pallad/config";
import { envFileProviderFactory } from "@pallad/config-envfile";
import { ssmProviderFactory } from "@pallad/config-ssm";

export function createPreset(presetOptions: Preset.Options) {
    const envHelper = envProviderFactory(presetOptions?.env || process.env);
    const envFileHelper = presetOptions.envFile ? envFileProviderFactory(presetOptions.envFile) : undefined;
    const ssmHelper = presetOptions.ssm ? ssmProviderFactory(presetOptions.ssm) : undefined;

    return (key: Preset.Key) => {
        const providers: Array<Provider<any>> = [];

        if (key.env) {
            providers.push(envHelper(key.env));
            if (envFileHelper) {
                providers.push(envFileHelper(key.env));
            }
        }

        if (key.ssmKey && ssmHelper) {
            providers.push(ssmHelper(key.ssmKey));
        }

        return new FirstAvailableProvider(...providers);
    };
}

export namespace Preset {
    export interface Key {
        env?: string;
        ssmKey?: string;
    }

    export interface Options {
        envFile?: envFileProviderFactory.Options;
        env?: (typeof process)["env"];
        ssm?: ssmProviderFactory.Options;
    }
}
