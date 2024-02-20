import { EnvProvider } from "../Providers";

export function envProviderFactory(envs: (typeof process)["env"] = process.env) {
    return (envName: string) => new EnvProvider(envName, envs);
}
