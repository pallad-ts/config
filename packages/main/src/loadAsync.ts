import { ResolvedConfig } from "./ResolvedConfig";
import { handleConfigLoadResult } from "./common/handleConfigLoadResult";
import { loadConfig } from "./common/loadConfig";

/**
 * Loads config asynchronously
 *
 * @public
 */
export async function loadAsync<T extends object>(config: T): Promise<ResolvedConfig<T>> {
    return handleConfigLoadResult(await loadConfig(config));
}
