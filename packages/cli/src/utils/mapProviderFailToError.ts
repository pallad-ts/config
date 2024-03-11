import { ERRORS, Provider, ValueNotAvailable } from "@pallad/config";

export function mapProviderFailToError(value: Provider.Fail | Provider.Fail[]): Error | Error[] {
    return Array.isArray(value) ? value.map(mapSingleFail) : mapSingleFail(value);
}

function mapSingleFail(value: Provider.Fail): Error {
    if (ValueNotAvailable.isType(value)) {
        return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.create(value.description);
    }
    return value;
}
