import { Provider } from "../Provider";
import { ERRORS } from "../errors";
import { ConfigError } from "../ConfigError";
import { ValueNotAvailable } from "../ValueNotAvailable";
import { Either } from "@sweet-monads/either";

/**
 * @internal
 */
export function handleConfigLoadResult<T>(result: Either<Provider.Fail, T>) {
    if (result.isLeft()) {
        const fail = result.value;
        const errors: Array<ConfigError | Error> = (Array.isArray(fail) ? fail : [fail]).map(x => {
            if (ValueNotAvailable.is(x)) {
                return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(x.description);
            }
            return x;
        });
        throw ERRORS.CONFIG_LOADING_FAILED.builder()
            .formatMessage(errors.map(x => `- ${x.message}`).join("\n"))
            .extraProperties({
                errors,
            })
            .create();
    }

    return result.value;
}
