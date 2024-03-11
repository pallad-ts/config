import { formatISODuration } from "date-fns/formatISODuration";
import { Duration } from "iso8601-duration";

import { Domain, ErrorDescriptor, formatCodeFactory } from "@pallad/errors";
import { enchant, Range } from "@pallad/range";

import { ConfigError } from "./ConfigError";
import { ConfigLoadError } from "./ConfigLoadError";

export const errorsDomain = new Domain();
const code = formatCodeFactory("E_CONF_%c");

export const ERRORS = errorsDomain.addErrorsDescriptorsMap({
    CONFIG_LOADING_FAILED: new ErrorDescriptor(
        code(1),
        (errorList: Array<Error | ConfigError>) => new ConfigLoadError(errorList)
    ),
    PROVIDER_VALUE_NOT_AVAILABLE: ErrorDescriptor.useMessageFormatter(
        code(2),
        (error: string) => `Value not available: ${error}`,
        ConfigError
    ),
    SYNC_LOADING_NOT_AVAILABLE: ErrorDescriptor.useDefaultMessage(
        code(3),
        "Cannot load config synchronously since one of your config value providers is asynchronous",
        ConfigError
    ),
    PICK_PROVIDER_UNREGISTERED_TYPE: ErrorDescriptor.useMessageFormatter(
        code(4),
        (type: string, availableTypeList: string[]) =>
            `Unregistered type "${type}". Registered values: ${availableTypeList.join(", ")}`,
        ConfigError
    ),
    PICK_PROVIDER_TYPE_ALREADY_EXISTS: ErrorDescriptor.useMessageFormatter(
        code(5),
        (type: string) => `Type "${type}" already registered`,
        ConfigError
    ),
    CANNOT_CONVERT_TO_INT: ErrorDescriptor.useMessageFormatter(
        code(6),
        (value: unknown) => `Value "${value}" cannot be converted to int`,
        ConfigError
    ),
    CANNOT_CONVERT_TO_NUMBER: ErrorDescriptor.useMessageFormatter(
        code(7),
        (value: unknown) => `Value "${value}" cannot be converted to number`,
        ConfigError
    ),
    CANNOT_CONVERT_TO_BOOL: ErrorDescriptor.useMessageFormatter(
        code(8),
        (value: unknown) => `Value "${value}" cannot be converted to bool`,
        ConfigError
    ),
    TYPE_URL_INVALID_PROTOCOL: ErrorDescriptor.useMessageFormatter(
        code(9),
        (protocol: string, validProtocolList: string[]) =>
            `Protocol "${protocol}" is not allowed. Allowed: ${validProtocolList.join(", ")}`,
        ConfigError
    ),
    CANNOT_CONVERT_TO_DURATION: ErrorDescriptor.useMessageFormatter(
        code(10),
        (value: unknown, errorMessage: string) =>
            `Value "${value}" cannot be converted to ISO duration - ${errorMessage}`,
        ConfigError
    ),
    DURATION_INVALID_VALUE_IN_RANGE: ErrorDescriptor.useMessageFormatter(
        code(11),
        (value: Duration, range: Range<Duration>) => {
            const rangeString = enchant(range).map({
                end: ({ end }) => "up to " + formatDuration(end),
                start: ({ start }) => "from " + formatDuration(start),
                full: ({ start, end }) => "between " + formatDuration(start) + " and " + formatDuration(end),
            });

            return `Duration "${formatDuration(value)}" is not in valid range ${rangeString}`;
        },
        ConfigError
    ),
});

function formatDuration(duration: Duration) {
    return Array.from(formatDurationParts(duration)).join("");
}

function* formatDurationParts({
    years = 0,
    months = 0,
    days = 0,
    weeks = 0,
    hours = 0,
    seconds = 0,
    minutes = 0,
}: Duration) {
    yield "P";

    if (years > 0) {
        yield `${years}Y`;
    }

    if (months > 0) {
        yield `${months}M`;
    }

    if (weeks > 0) {
        yield `${weeks}W`;
    }

    if (days > 0) {
        yield `${days}D`;
    }

    if (hours > 0 || minutes > 0 || seconds > 0) {
        yield "T";
        if (hours > 0) {
            yield `${hours}H`;
        }

        if (minutes > 0) {
            yield `${minutes}M`;
        }

        if (seconds > 0) {
            yield `${seconds}S`;
        }
    }
}
