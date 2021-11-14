import {Domain, generators} from 'alpha-errors';
import {ConfigError} from "./ConfigError";

export const ERRORS = new Domain({
    errorClass: ConfigError,
    codeGenerator: generators.formatCode('E_CONF_%d')
}).createErrors(create => {
    return {
        CONFIG_LOADING_FAILED: create('Config loading failed: \s%s'),
        PROVIDER_VALUE_NOT_AVAILABLE: create('Value not available: %s'),
        SYNC_LOADING_NOT_AVAILABLE: create('Cannot load config synchronously since one of your config value providers is asynchronous'),
        PICK_PROVIDER_UNREGISTERED_TYPE: create('Unregistered type "%s". Registered values: %s'),
        PICK_PROVIDER_TYPE_ALREADY_EXISTS: create('Type "%s" already registered'),
        CANNOT_CONVERT_TO_INT: create(`Value "%s" cannot be converted to int`),
        CANNOT_CONVERT_TO_NUMBER: create(`Value "%s" cannot be converted to number`),
        CANNOT_CONVERT_TO_BOOL: create(`Value "%s" cannot be converted to bool`),
        TYPE_URL_INVALID_PROTOCOL: create('Protocol "%s" is not allowed. Allowed: %s'),
        INVALID_PORT_NUMBER: create('Port "%s" is invalid. Allowed ranges: %s')
    };
});
