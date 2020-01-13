import {Command, flags} from '@oclif/command'
import * as fs from 'fs';
import * as is from 'predicates';
import {Dependency, getDependencies} from "@pallad/config";
import {Validation} from "monet";
import chalk = require('chalk');

class ConfigCheck extends Command {
    static description = 'Checks config created with @pallad/config';

    static flags = {
        property: flags.string({
            char: 'p',
            description: `name of module's property that exports config`
        }),
        failsOnly: flags.boolean({
            char: 'f',
            description: `display only failed dependencies`,
            default: false
        })
    };

    static args = [{
        name: 'file',
        required: false,
        description: 'path to module that exports a function returning config'
    }];

    async run() {
        const {args, flags} = this.parse(ConfigCheck);
        const filePath = args.file || this.findFileCandidate();

        if (!filePath) {
            this.error('No config file defined');
            return;
        }

        if (!fs.existsSync(filePath)) {
            this.error(`File "${filePath}" does not exist`);
            return;
        }

        const config = await this.getConfig(filePath, flags.property);
        const deps = getDependencies(config);

        await this.displayDependencies(deps, flags.failsOnly);
    }

    private getConfig(filePath: string, property?: string) {
        const module = require(fs.realpathSync(filePath));

        const func = property ? module[property] : module;

        if (!is.func(func)) {
            if (property) {
                throw new Error(`Property "${property}" from module "${filePath}" is not a function`);
            }
            throw new Error(`Module "${filePath}" does not export a function`)
        }

        return func();
    }

    private async displayDependencies(deps: Array<Dependency<any>>, failsOnly: boolean) {
        if (deps.length === 0) {
            this.log('No config dependencies found');
            this.exit(0);
            return;
        }

        async function loadDependencyResult(dep: Dependency<any>): Promise<[Dependency<any>, Validation<Error, any>]> {
            return [
                dep,
                await (
                    dep.getValue()
                        .then(x => Validation.Success<Error, any>(x))
                        .catch(e => Validation.Fail<Error, any>(e))
                )
            ]
        }

        let results = await Promise.all(
            deps.map(loadDependencyResult)
        );

        if (failsOnly) {
            results = results.filter(([, result]) => result.isFail());
        }

        for (const [dep, result] of results) {
            const resultString = result.isSuccess() ? chalk.green('success') : chalk.red('failure');
            this.log(`%s\t- %s`, resultString, dep.getDescription());
            if (result.isFail()) {
                this.log(chalk.red(result.fail().message));
            }
        }

        const hasFails = results.some(([, result]) => result.isFail());
        if (hasFails) {
            this.log(chalk.red('Some configuration dependencies have failed to load'));
            this.exit(1)
        } else {
            this.log('Configuration looks fine!');
            this.exit(0)
        }
    }

    private findFileCandidate() {
        const commonFile = this.findCommonConfigFiles();
        if (commonFile) {
            return commonFile;
        }
    }

    private findCommonConfigFiles() {
        const candidates = [
            './pallad.config.js'
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
    }
}

export = ConfigCheck;
