import {Command, flags} from '@oclif/command'
import * as fs from 'fs';
import * as is from 'predicates';
import {Either, Validation} from "monet";
import {cosmiconfig} from 'cosmiconfig';
import {get as getProperty} from 'object-path';
import {Provider, extractProvidersFromConfig, replaceProvidersInConfig} from '@pallad/config';
import {Secret} from '@pallad/secret';
import * as chalk from 'chalk';
import {format as prettyFormat} from 'pretty-format'
import {Config, Plugin, Printer, Refs} from 'pretty-format/build/types';

class ConfigCheck extends Command {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static description = 'Display config created with @pallad/config';

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static flags = {
        failsOnly: flags.boolean({
            char: 'f',
            description: `display only failed dependencies`,
            default: false
        }),
        revealSecrets: flags.boolean({
            default: false
        })
    };

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static args = [{
        name: 'configPath',
        required: false,
        description: 'config path to display'
    }];

    async run() {
        const {args, flags} = this.parse(ConfigCheck);
        const configuration = await this.getConfiguration();
        const config = this.getConfig(configuration);

        const finalConfig = args.configPath ? getProperty(config, args.configPath) : config;

        const resolvedConfig = await this.loadConfig(finalConfig);

        this.displayConfig(resolvedConfig, {
            revealSecrets: flags.revealSecrets
        });
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
        if (is.primitive(config)) {
            return config;
        }
        const providers = extractProvidersFromConfig(config);
        const map = new Map<Provider<any>, ResolvedProviderValue>();
        await Promise.all(
            providers.map(async x => {
                try {
                    const value = await x.getValue();
                    map.set(x, Validation.Success({
                        value,
                        provider: x
                    }));
                } catch (e) {
                    map.set(x, Validation.Fail({
                        error: e as any,
                        provider: x
                    }));
                }
            })
        );

        return replaceProvidersInConfig(config, map);
    }

    private displayConfig(config: any, options: { revealSecrets: boolean }) {
        function renderSecret(secret: Secret<any>) {
            if (options.revealSecrets) {
                return secret.getValue();
            }
            return secret.getDescription();
        }

        const secretPlugin: Plugin = {
            test(value: any) {
                return Secret.is(value);
            },
            serialize(val: Secret<any>, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) {
                return printer(renderSecret(val), config, indentation, depth, refs, true)
                    + ' '
                    + chalk.yellow('(secret)');
            }
        };

        const providerPlugin: Plugin = {
            test(value: any) {
                return Validation.isInstance(value)
            },
            serialize(val: ResolvedProviderValue, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) {
                if (val.isSuccess()) {
                    return printer(val.success().value, config, indentation, depth, refs, false)
                        + ' '
                        + chalk.green('(' + val.success().provider.getDescription() + ')');
                }

                return chalk.red(val.fail().error.message);
            }
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

type ResolvedProviderValue = Validation<{ error: Error, provider: Provider<any> }, { value: any, provider: Provider<any> }>;

interface Configuration {
    file: string;
    property?: string;
}

export = ConfigCheck;
