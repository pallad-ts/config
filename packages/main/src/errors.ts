import {Domain, generators} from 'alpha-errors';
import {ConfigError} from "./ConfigError";

export const ERRORS = new Domain({
    errorClass: ConfigError,
    codeGenerator: generators.formatCode('E_CONF_%d')
}).createErrors(create => {
    return {
        PROVIDER_VALUE_NOT_AVAILABLE: create('Config value not available: %s')
    };
});
