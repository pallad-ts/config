import { Command, Flags, Args } from "@oclif/core";
import * as fs from "fs";
import * as is from "predicates";
import { cosmiconfig } from "cosmiconfig";
import { get as getProperty } from "object-path";
import {
    Provider,
    extractProvidersFromConfig,
    replaceProvidersInConfig,
    ERRORS,
    ValueNotAvailable,
} from "@pallad/config";
import { Secret } from "@pallad/secret";
import chalk from "chalk";
import { format as prettyFormat, Config, Plugin, Printer, Refs } from "pretty-format";
import { Either, isEither, left, right } from "@sweet-monads/either";

class ConfigCheck extends Command {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static description = "Display config created with @pallad/config";

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static flags = {
        revealSecrets: Flags.boolean({
            default: false,
            description: "Whether to reveal secret values from @pallad/secret",
        }),
        silent: Flags.boolean({
            default: false,
            char: "s",
            description: "Do not display config",
        }),
    };

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static args = {
        configPath: Args.string({
            name: "configPath",
            required: false,
            // eslint-disable-next-line @typescript-eslint/require-await
            async parse(value: string) {
                if (is.startsWith("-", value)) {
                    throw new Error(
                        `Property path: ${value} is rather a typo. Please use property path that does not start with "-"`
                    );
                }
                return value;
            },
            description: "config property path to display",
        }),
    };

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static strict = true;

    async run() {
        const { args, flags } = await this.parse(ConfigCheck);
        const configuration = await this.getConfiguration();
        const config = this.getConfig(configuration);

        const finalConfig = args.configPath ? getProperty(config, args.configPath) : config;

        const { config: resolvedConfig, providersMap } = await this.loadConfig(finalConfig);

        if (!flags.silent) {
            this.displayConfig(resolvedConfig, {
                revealSecrets: flags.revealSecrets,
                propertyPath: args.configPath,
            });
        }

        const hasFailures = Array.from(providersMap.values()).some(x => x.isLeft());

        process.exit(hasFailures ? 1 : 0);
    }

    private async getConfiguration(): Promise<Configuration> {
        const explorer = cosmiconfig("pallad-config");
        const result = await explorer.search();

        if (!result || !result.config) {
            throw new Error("Missing configuration for pallad-config");
        }

        if (!is.string(result.config.file)) {
            throw new Error('"file" config value must be a string');
        }

        if (result.config.property && !is.string(result.config.property)) {
            throw new Error('"property" config value must be a string');
        }

        return {
            file: result.config.file,
            property: result.config.property,
        };
    }

    private getConfig(configuration: Configuration) {
        const module = require(fs.realpathSync(configuration.file));

        if (configuration.property) {
            const func = module[configuration.property];
            if (!is.func(func)) {
                throw new Error(
                    `Property "${configuration.property}" from module "${configuration.file}" is not a function`
                );
            }
            return func();
        }

        const foundFunc = this.findConfigFunctionInModule(module, configuration.file);
        if (foundFunc.isLeft()) {
            throw new Error(foundFunc.value);
        }
        return foundFunc.value();
    }

    private findConfigFunctionInModule(module: any, modulePath: string): Either<string, Function> {
        if (is.func(module)) {
            return right(module);
        }
        const funcs = Array.from(Object.values(module)).filter(is.func);
        if (funcs.length > 1) {
            return left(
                `Found 2 exported functions in module: ${modulePath}.
                We do not know which one is responsible for generating configuration shape.
                Please define "property" in config explicitly.`
            );
        }

        if (funcs.length === 0) {
            return left(`No functions generating configuration shape found in module: ${modulePath}`);
        }

        return right(funcs[0]);
    }

    private async loadConfig(config: any) {
        const map = new Map<Provider<any>, Provider.Value<any>>();
        if (is.primitive(config)) {
            return { config, providersMap: map };
        }
        const providers = extractProvidersFromConfig(config);

        for (const provider of providers) {
            const value = await provider.getValue();

            map.set(provider, value);
        }
        return {
            config: replaceProvidersInConfig(config, map as any),
            providersMap: map,
        };
    }

    private displayConfig(config: any, options: { revealSecrets: boolean; propertyPath?: string }) {
        function renderSecret(secret: Secret<any>, printer: (value: any) => string) {
            if (options.revealSecrets) {
                return printer(secret.getValue());
            }
            return secret.getDescription();
        }

        const secretPlugin: Plugin = {
            test(value: any) {
                return Secret.is(value);
            },
            serialize(
                val: Secret<any>,
                config: Config,
                indentation: string,
                depth: number,
                refs: Refs,
                printer: Printer
            ) {
                return (
                    renderSecret(val, value => printer(value, config, indentation, depth, refs, true)) +
                    " " +
                    chalk.yellow("(secret)")
                );
            },
        };

        const providerPlugin: Plugin = {
            test(value: any) {
                return value && isEither(value);
            },
            serialize(
                val: Provider.Value<any>,
                config: Config,
                indentation: string,
                depth: number,
                refs: Refs,
                printer: Printer
            ) {
                if (val.isRight()) {
                    return printer(val.value, config, indentation, depth, refs, false);
                }
                const fail = val.value;
                const errors = (Array.isArray(fail) ? fail : [fail])
                    .map(x => {
                        if (ValueNotAvailable.is(x)) {
                            return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(x.description);
                        }
                        return x;
                    })
                    .map(x => x.message);
                return chalk.red(errors.join(", "));
            },
        };

        if (options.propertyPath) {
            console.log(`Displaying config at property path: ${chalk.greenBright(options.propertyPath)}`);
        }

        console.log(
            prettyFormat(config, {
                plugins: [secretPlugin, providerPlugin],
            })
        );
    }
}

interface ProviderValue {
    provider: Provider<any>;
    value: Provider.Value<any>;
}

interface Configuration {
    file: string;
    property?: string;
}

export = ConfigCheck;
