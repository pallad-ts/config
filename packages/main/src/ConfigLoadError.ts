import { ConfigError } from "./ConfigError";
import { getCodeFromError, isErrorWithCode } from "@pallad/errors";

export class ConfigLoadError extends ConfigError {
    constructor(readonly errorList: Array<Error | ConfigError>) {
        const descriptionList = errorList.map(ConfigLoadError.extractDescriptionFromError);
        super("Config loading failed: \n" + descriptionList.join("\n"));

        this.name = "ConfigLoadError";
    }

    static extractDescriptionFromError(error: Error | ConfigError): string {
        const partList: string[] = [];

        const code = getCodeFromError(error);
        if (code) {
            partList.push(`Code: ${code}`);
        }

        partList.push(error.message);

        return partList.join(" - ");
    }
}
