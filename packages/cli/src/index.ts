import {Command, flags} from '@oclif/command'
import * as fs from 'fs';
import * as is from 'predicates';
import {Validation} from "monet";
import {cosmiconfig} from 'cosmiconfig';
import {get as getProperty} from 'object-path';
import {Provider, extractProvidersFromConfig, replaceProvidersInConfig, ERRORS, ValueNotAvailable} from '@pallad/config';
import {Secret} from '@pallad/secret';
import * as chalk from 'chalk';
import {format as prettyFormat} from 'pretty-format'
import {Config, Plugin, Printer, Refs} from 'pretty-format/build/types';

class ConfigCheck extends Command {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static description = 'Display config created with @pallad/config';

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static flags = {
        revealSecrets: flags.boolean({
            default: false,
            description: 'Whether to reveal secret values from @pallad/secret'
        }),
        silent: flags.boolean({
            default: false,
            char: 's',
            description: 'Do not display config'
        })
    };

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static args = [{
        name: 'configPath',
        required: false,
        parse(value: string) {
            if (is.startsWith('-', value)) {
                throw new Error(`Property path: ${value} is rather a typo. Please use property path that does not start with "-"`)
            }
            return value;
        },
        description: 'config property path to display'
    }];

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static strict = true;

    async run() {
        const {args, flags} = this.parse(ConfigCheck);
        const configuration = await this.getConfiguration();
        const config = this.getConfig(configuration);

        const finalConfig = args.configPath ? getProperty(config, args.configPath) : config;

        const {config: resolvedConfig, providersMap} = await this.loadConfig(finalConfig);

        this.displayConfig(resolvedConfig, {
            revealSecrets: flags.revealSecrets,
            propertyPath: args.configPath
        });

        const hasFailures = Array.from(providersMap.values())
            .some(x => x.success().isFail());

        process.exit(hasFailures ? 1 : 0);
    }

    private async getConfiguration(): Promise<Configuration> {
        const explorer = cosmiconfig('pallad-config');
        const result = await explorer.search();

        if (!result || !result.config) {
            throw new Error('Missing configuration for pallad-config');
        }

        if (!is.string(result.config.file)) {
            throw new Error('"file" config value must be a string');
        }

        if (result.config.property && !is.string(result.config.property)) {
            throw new Error('"property" config value must be a string');
        }

        return {
            file: result.config.file,
            property: result.config.property
        };
    }

    private getConfig(configuration: Configuration) {
        const module = require(fs.realpathSync(configuration.file));

        const func = configuration.property ? module[configuration.property] : module;

        if (!is.func(func)) {
            if (configuration.property) {
                throw new Error(`Property "${configuration.property}" from module "${configuration.file}" is not a function`);
            }
            throw new Error(`Module "${configuration.file}" does not export a function`)
        }
        return func();
    }

    private async loadConfig(config: any) {
        const map = new Map<Provider<any>, Validation<unknown, Provider.Value<any>>>();
        if (is.primitive(config)) {
            return {config, providersMap: map};
        }
        const providers = extractProvidersFromConfig(config);

        for (const provider of providers) {
            const value = await provider.getValue();

            map.set(provider, Validation.Success(value));
        }
        return {
            config: replaceProvidersInConfig(config, map as any),
            providersMap: map
        };
    }

    private displayConfig(config: any, options: { revealSecrets: boolean, propertyPath?: string }) {
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
            serialize(val: Secret<any>, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) {
                return renderSecret(val, value => printer(value, config, indentation, depth, refs, true))
                    + ' '
                    + chalk.yellow('(secret)');
            }
        };

        const providerPlugin: Plugin = {
            test(value: any) {
                return value && Validation.isInstance(value)
            },
            serialize(val: Provider.Value<any>, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) {
                if (val.isSuccess()) {
                    return printer(val.success(), config, indentation, depth, refs, false);
                }
                const fail = val.fail();
                const errors = (Array.isArray(fail) ? fail : [fail])
                    .map(x => {
                        if (ValueNotAvailable.is(x)) {
                            return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(x.description);
                        }
                        return x;
                    })
                    .map(x => x.message);
                return chalk.red(errors.join(', '));
            }
        }

        if (options.propertyPath) {
            console.log(`Displaying config at property path: ${chalk.greenBright(options.propertyPath)}`);
        }

        console.log(
            prettyFormat(
                config, {
                    plugins: [
                        secretPlugin,
                        providerPlugin
                    ]
                }
            )
        );
    }
}

interface ProviderValue {
    provider: Provider<any>,
    value: Provider.Value<any>
}

interface Configuration {
    file: string;
    property?: string;
}

export = ConfigCheck;
