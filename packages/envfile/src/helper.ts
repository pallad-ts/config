import {EnvFileLoader} from "./EnvFileLoader";
import {DefaultValueDependency, TransformableDependency} from "@pallad/config";
import {EnvFileDependency} from "./EnvFileDependency";

export function createEnvFileHelper(options: EnvFileHelper.Options) {
    const loader = new EnvFileLoader(Array.isArray(options.paths) ? options.paths : [options.paths], options.config);

    return function <T>(key: string, opts?: EnvFileHelper.HelperOptions<T>) {
        return DefaultValueDependency.create(
            new EnvFileDependency(key, opts && opts.transformer, loader),
            opts && opts.defaultValue
        );
    }
}

export namespace EnvFileHelper {
    export interface Options {
        paths: string[] | string,
        config?: Partial<EnvFileLoader.Config>
    }

    export interface HelperOptions<T> {
        transformer?: TransformableDependency.Transformer<T>,
        defaultValue?: T
    }
}