import { Domain, ErrorDescriptor, formatCodeFactory } from "@pallad/errors";
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
});
