import {Domain, generators} from 'alpha-errors';
import {ConfigError} from "@pallad/config";

export const ERRORS = new Domain({
    errorClass: ConfigError,
    codeGenerator: generators.formatCode('E_CONF_ENVFILE_%d')
}).createErrors(create => {
    return {
        ENV_FILE_DOES_NOT_EXIST: create('Env file %s does not exist but it is required'),
    };
});
