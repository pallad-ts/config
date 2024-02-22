import { ERRORS } from "./errors";
import { loadConfig } from "./common/loadConfig";
import { isPromise } from "./common/isPromise";
import { handleConfigLoadResult } from "./common/handleConfigLoadResult";
import { ResolvedConfig } from "./ResolvedConfig";

/**
 * Loads config synchronously
 *
 * If config contains any asynchronous provider then loading fails
 *
 * @public
 */
export function loadSync<T extends object>(config: T): ResolvedConfig<T> {
    const result = loadConfig(config);
    if (isPromise(result)) {
        throw ERRORS.SYNC_LOADING_NOT_AVAILABLE.create();
    }
    return handleConfigLoadResult(result);
}
