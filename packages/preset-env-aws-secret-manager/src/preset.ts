import { FirstAvailableProvider } from "@pallad/config";
import { envProviderFactory } from "@pallad/config";
import { secretManagerProviderFactory, SecretReference } from "@pallad/config-aws-secret-manager";
import { envFileProviderFactory } from "@pallad/config-envfile";

export function createPreset(presetOptions: Preset.Options) {
    const envHelper = envProviderFactory(presetOptions?.env || process.env);
    const envFileHelper = presetOptions.envFile ? envFileProviderFactory(presetOptions.envFile) : undefined;
    const secretManagerHelper = presetOptions.secretManager
        ? secretManagerProviderFactory(presetOptions.secretManager)
        : undefined;

    function* generator(key: Preset.Key) {
        if (key.env) {
            yield envHelper(key.env);
            if (envFileHelper) {
                yield envFileHelper(key.env);
            }
        }

        if (key.secretReference && secretManagerHelper) {
            yield secretManagerHelper(key.secretReference);
        }
    }

    return (key: Preset.Key) => {
        return new FirstAvailableProvider(...generator(key));
    };
}

export namespace Preset {
    export interface Key {
        env?: string;
        secretReference?: SecretReference;
    }

    export interface Options {
        envFile?: envFileProviderFactory.Options;
        env?: (typeof process)["env"];
        secretManager?: secretManagerProviderFactory.Options;
    }
}
