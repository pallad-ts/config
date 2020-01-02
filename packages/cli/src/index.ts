import {Command, flags} from '@oclif/command'
import * as fs from 'fs';
import * as is from 'predicates';
import {getDependencies} from "@pallad/config";
import * as Listr from "listr";

class ConfigCheck extends Command {
    static description = 'Checks config created with @pallad/config';

    static flags = {
        property: flags.string({
            char: 'p',
            description: `name of module's property that exports config`
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

        const module = require(fs.realpathSync(filePath));

        const func = flags.property ? module[flags.property] : module;

        if (!is.func(func)) {
            if (flags.property) {
                this.error(`Property "${flags.property}" from module "${filePath}" is not a function`);
            } else {
                this.error(`Module "${filePath}" does not export a function`);
            }
            return;
        }

        const config = await func();
        const deps = getDependencies(config);

        if (deps.length === 0) {
            this.log('No config dependencies found');
            this.exit(0);
            return;
        }

        const tasks = deps.map(dep => {
            return {
                title: dep.getDescription(),
                task: () => {
                    return dep.getValue();
                }
            }
        });

        const listr = new Listr(tasks, {
            concurrent: true,
            exitOnError: false
        });

        try {
            await listr.run();
        } catch (e) {
            this.exit(1);
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
