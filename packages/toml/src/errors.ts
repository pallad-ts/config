import { ConfigError } from "@pallad/config";
import { Domain, ErrorDescriptor, formatCodeFactory } from "@pallad/errors";

const errorsDomain = new Domain();
const code = formatCodeFactory("E_CONF_TOML_%c");

export const ERRORS = errorsDomain.addErrorsDescriptorsMap({
    ENV_FILE_DOES_NOT_EXIST: ErrorDescriptor.useMessageFormatter(
        code(1),
        (filePath: string) => `TOML file "${filePath}" does not exist but it is required`,
        ConfigError
    ),
});
