import { loadConfig } from "./common/loadConfig";
import { handleConfigLoadResult } from "./common/handleConfigLoadResult";
import { ResolvedConfig } from "./ResolvedConfig";

/**
 * Loads config asynchronously
 *
 * @public
 */
export async function loadAsync<T extends object>(config: T): Promise<ResolvedConfig<T>> {
    return handleConfigLoadResult(await loadConfig(config));
}
