import { Command, Flags, Args } from "@oclif/core";
import * as is from "predicates";

import { renderConfig } from "./utils/renderConfig";
import { resolveConfig } from "./utils/resolveConfig";

class ConfigCheck extends Command {
    static description = "Display config created with @pallad/config";

    static flags = {
        revealSecrets: Flags.boolean({
            default: false,
            description: "Reveal secret values from @pallad/secret",
        }),
        silent: Flags.boolean({
            default: false,
            char: "s",
            description: "Do not display config",
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

    // to bring back within https://github.com/pallad-ts/config/issues/53
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

        if (!flags.silent) {
            this.log(
                renderConfig(resolvedConfig, {
                    revealSecrets: flags.revealSecrets,
                })
            );
        }

        const hasFailures = Array.from(providerMap.values()).some(x => x.isLeft());
        this.exit(hasFailures ? 1 : 0);
    }
}

export = ConfigCheck;
