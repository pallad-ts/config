import {Config} from './Config';
import {loadConfig} from './common/loadConfig';

/**
 * Loads config asynchronously
 */
export async function loadAsync<T extends Config>(config: T): Promise<Config.Resolved<T>> {
    return loadConfig(config);
}
