import { ERRORS, Provider, ValueNotAvailable } from "@pallad/config";

export function mapProviderFailToError(value: Provider.Fail): Error {
    if (ValueNotAvailable.isType(value)) {
        return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.create(value.description);
    }
    return value;
}
