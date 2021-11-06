import {Validation} from 'monet';
import {Provider} from '../Provider';
import {ERRORS} from '../errors';
import {ConfigError} from '../ConfigError';
import {ValueNotAvailable} from '../ValueNotAvailable';

/**
 * @internal
 */
export function handleConfigLoadResult<T>(result: Validation<Provider.Fail, T>) {
    if (result.isFail()) {
        const fail = result.fail()
        const errors: Array<ConfigError | Error> = (Array.isArray(fail) ? fail : [fail])
            .map(x => {
                if (ValueNotAvailable.is(x)) {
                    return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(x.description);
                }
                return x;
            });
        throw ERRORS.CONFIG_LOADING_FAILED.builder()
            .formatMessage(errors.map(x => `- ${x.message}`).join('\n'))
            .extraProperties({
                errors
            })
            .create();
    }

    return result.success();
}
