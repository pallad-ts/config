import {Config} from './Config';
import {loadConfig} from './common/loadConfig';
import {handleConfigLoadResult} from './common/handleConfigLoadResult';

/**
 * Loads config asynchronously
 */
export async function loadAsync<T extends Config>(config: T): Promise<Config.Resolved<T>> {
    return handleConfigLoadResult(await loadConfig(config));
}
