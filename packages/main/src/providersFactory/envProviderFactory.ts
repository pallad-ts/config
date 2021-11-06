import {EnvProvider, wrapWithDefaultAndTransformer} from '../Providers';

export function envProviderFactory(envs: typeof process['env'] = process.env) {
    return wrapWithDefaultAndTransformer.wrap((envName: string) => new EnvProvider(envName, envs));
}
