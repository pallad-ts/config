import { FirstAvailableProvider, Provider } from "@pallad/config";
import { envProviderFactory } from "@pallad/config";
import { envFileProviderFactory } from "@pallad/config-envfile";
import { ssmProviderFactory } from "@pallad/config-ssm";

export function createPreset(presetOptions: Preset.Options) {
    const envHelper = envProviderFactory(presetOptions?.env || process.env);
    const envFileHelper = presetOptions.envFile ? envFileProviderFactory(presetOptions.envFile) : undefined;
    const ssmHelper = presetOptions.ssm ? ssmProviderFactory(presetOptions.ssm) : undefined;

    function* generator(key: Preset.Key) {
        if (key.env) {
            yield envHelper(key.env);
            if (envFileHelper) {
                yield envFileHelper(key.env);
            }
        }

        if (key.ssmKey && ssmHelper) {
            yield ssmHelper(key.ssmKey);
        }
    }

    return (key: Preset.Key) => {
        return new FirstAvailableProvider(...generator(key));
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
