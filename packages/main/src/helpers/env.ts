import {ENVDependency, DefaultValueDependency, TransformableDependency} from "../Dependencies";

export function createEnvHelper(envs: typeof process['env']) {
    return <T = string>(key: string, options?: ENVHelperOptions<T>) => {
        return DefaultValueDependency.create<T>(
            new ENVDependency<T>(key, options && options.transformer, envs),
            options && options.defaultValue
        );
    }
}

export const env = createEnvHelper(process.env);

export interface ENVHelperOptions<T> {
    transformer?: TransformableDependency.Transformer<T>,
    defaultValue?: T
}