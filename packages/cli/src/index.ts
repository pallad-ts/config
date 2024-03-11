import { Command, Flags, Args } from "@oclif/core";
import * as is from "predicates";

import { mapProviderFailToError } from "./utils/mapProviderFailToError";
import { renderConfig } from "./utils/renderConfig";
import { resolveConfig } from "./utils/resolveConfig";

class ConfigCheck extends Command {
    static description = "Display config created with @pallad/config";

    static flags = {
        revealSecrets: Flags.boolean({
            default: false,
            description: "Reveal secret values from @pallad/secret",
        }),
        display: Flags.string({
            char: "d",
            options: ["none", "fails-only", "all"] as const,
            default: "all",
        }),
        config: Flags.string({
            default: undefined,
            char: "c",
            description: "Path to the file with configuration",
        }),
        configDir: Flags.string({
            default: undefined,
            description: "Config directory from which cosmiconfig will search for configuration files",
        }),
    };

    // static args = {
    //     configPath: Args.string({
    //         name: "configPath",
    //         required: false,
    //         // eslint-disable-next-line @typescript-eslint/require-await
    //         async parse(value: string) {
    //             if (is.startsWith("-", value)) {
    //                 throw new Error(
    //                     `Property path: ${value} is rather a typo. Please use property path that does not start with "-"`
    //                 );
    //             }
    //             return value;
    //         },
    //         description: "config property path to display",
    //     }),
    // };

    static strict = true;

    async run() {
        const { flags } = await this.parse(ConfigCheck);

        const config = await resolveConfig({
            filePath: flags.config,
            directoryStartPath: flags.configDir,
        });
        if (config.isNone()) {
            this.error(
                "No configuration found. Please refer to https://pallad.dev/config/cli#setup for more information"
            );
        }

        if (config.value.isLeft()) {
            const error = config.value.value;
            this.error(error.message, {
                suggestions: ["Refer to https://pallad.dev/config/cli#configuration-options for more information"],
            });
        }

        const { config: resolvedConfig, providerMap } = config.value.value;

        if (flags.display === "all") {
            this.log(
                renderConfig(resolvedConfig, {
                    revealSecrets: flags.revealSecrets,
                })
            );
        } else if (flags.display === "fails-only") {
            for (const providerValue of providerMap.values()) {
                if (providerValue.isLeft()) {
                    const mappedError = mapProviderFailToError(providerValue.value);
                    for (const error of Array.isArray(mappedError) ? mappedError : [mappedError]) {
                        this.error(error, { exit: false });
                    }
                }
            }
        }

        const hasFailures = Array.from(providerMap.values()).some(x => x.isLeft());
        this.exit(hasFailures ? 1 : 0);
    }
}

export = ConfigCheck;
