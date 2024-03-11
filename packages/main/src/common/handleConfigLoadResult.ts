import { Provider } from "../Provider";
import { ERRORS } from "../errors";
import { ConfigError } from "../ConfigError";
import { ValueNotAvailable } from "../ValueNotAvailable";
import { Either } from "@sweet-monads/either";

/**
 * @internal
 */
export function handleConfigLoadResult<T>(result: Either<Provider.Fail[], T>) {
    if (result.isLeft()) {
        const fail = result.value;
        const errorList: Array<ConfigError | Error> = (Array.isArray(fail) ? fail : [fail]).map(x => {
            if (ValueNotAvailable.isType(x)) {
                return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.create(x.description);
            }
            return x;
        });
        throw ERRORS.CONFIG_LOADING_FAILED.create(errorList);
    }

    return result.value;
}
