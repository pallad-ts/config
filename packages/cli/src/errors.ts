import { ConfigError } from "@pallad/config";
import { Domain, ErrorDescriptor, formatCodeFactory } from "@pallad/errors";

const errorsDomain = new Domain();
const code = formatCodeFactory("E_CONF_CLI_%c");

export const ERRORS = errorsDomain.addErrorsDescriptorsMap({
    INVALID_CONFIG_VALUE_AT_PATH: ErrorDescriptor.useMessageFormatter(
        code(1),
        (parentConfigValue: unknown, propertyPath: string[]) =>
            `Cannot get config at property "${propertyPath.join(",")}" from config since parent value is of type: ${typeof parentConfigValue}`,
        ConfigError
    ),
});
