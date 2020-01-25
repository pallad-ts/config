import {createEnvFileHelper, EnvFileHelper} from '@pallad/config-envfile';
import {createSSMHelper, SSMHelper} from '@pallad/config-ssm';
import {createEnvHelper, DefaultValueDependency, Dependency, FirstAvailableDependency, TransformableDependency} from "@pallad/config";

function identity(x: any) {
    /* istanbul ignore next */
    return x;
}

export function createPreset(presetOptions: Options) {
    const envHelper = createEnvHelper(presetOptions?.env || process.env);
    const envFileHelper = presetOptions.envFile ? createEnvFileHelper(presetOptions.envFile) : undefined;
    const ssmHelper = presetOptions.ssm ? createSSMHelper(presetOptions.ssm) : undefined;


    return function <T = any>(key: PresetHelper.Key, options?: PresetHelper.HelperOptions<T>): Dependency<T> {
        const deps: Array<Dependency<T>> = [];

        const transformer = options?.transformer;
        if (key.env) {
            deps.push(envHelper(key.env, {transformer}));
            if (envFileHelper) {
                deps.push(envFileHelper(key.env, {transformer}));
            }
        }

        if (key.ssmKey && ssmHelper) {
            deps.push(ssmHelper(key.ssmKey, {transformer}));
        }

        return DefaultValueDependency.create<T>(
            new FirstAvailableDependency(...deps),
            options?.defaultValue
        );
    };
}

export interface Options {
    envFile?: EnvFileHelper.Options;
    env?: typeof process['env'];
    ssm?: SSMHelper.Options;
}

export type PresetHelper = ReturnType<typeof createPreset>;

export namespace PresetHelper {
    export interface Key {
        env?: string;
        ssmKey?: string;
    }

    export interface HelperOptions<T> {
        transformer?: TransformableDependency.Transformer<T>;
        defaultValue?: T;
    }
}