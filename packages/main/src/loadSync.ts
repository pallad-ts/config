import {Config} from "./Config";
import {ERRORS} from './errors';
import {loadConfig} from './common/loadConfig';
import {isPromise} from './common/isPromise';

/**
 * Loads config synchronously
 *
 * If config contains any asynchronous provider then loading fails
 */
export function loadSync<T extends Config>(config: T): Config.Resolved<T> {
    const result = loadConfig(config);
    if (isPromise(result)) {
        throw ERRORS.SYNC_LOADING_NOT_AVAILABLE();
    }
    return result;
}
