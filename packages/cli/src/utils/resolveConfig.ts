import { cosmiconfig } from "cosmiconfig";

import { loadConfigFromShape } from "./loadConfigFromShape";
import { resolveConfigurationShapeCosmiConfig } from "./resolveConfigurationShapeCosmiConfig";

export async function resolveConfig(options: resolveConfigurationShapeCosmiConfig.Options) {
    const explorer = cosmiconfig("pallad-config");
    return (await resolveConfigurationShapeCosmiConfig(explorer, options)).asyncMap(configShape => {
        return configShape.asyncMap(shape => {
            return loadConfigFromShape(shape);
        });
    });
}
