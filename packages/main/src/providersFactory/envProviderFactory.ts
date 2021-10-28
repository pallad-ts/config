import {EnvProvider, wrapWithDefaultAndTransformer} from '../Providers';

export function envProviderFactory(envs: typeof process['env'] = process.env) {
    return <TTransformed, TDefault>(
        envName: string,
        options?: wrapWithDefaultAndTransformer.Options<TTransformed, TDefault, string>
    ) => {
        return wrapWithDefaultAndTransformer(new EnvProvider(envName, envs), options);
    }
}
