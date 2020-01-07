import * as fs from 'fs';
import {promisify} from 'util';
import {parse} from 'dotenv';

export class EnvFileLoader {
    private _loaded: Promise<any> | undefined;

    private config: EnvFileLoader.Config;

    constructor(private paths: string[], config?: Partial<EnvFileLoader.Config>) {
        this.config = {
            ...EnvFileLoader.DEFAULT_CONFIG,
            ...(config || {})
        };
    }

    load() {
        if (!this._loaded) {
            this._loaded = this._load();
        }
        return this._loaded;
    }

    private async _load() {
        const loaded = await Promise.all(
            this.paths.map(path => this._loadFile(path))
        );

        let config: any = {};
        for (const conf of loaded) {
            config = {...config, ...conf};
        }
        return config;
    }

    private _loadFile(path: string): Promise<any> {
        return promisify(fs.readFile)(path, 'utf8')
            .then(parse)
            .catch(e => {
                if (this.config.ignoreNonExisting) {
                    return {};
                }
                throw e;
            })
    }

    static DEFAULT_CONFIG: EnvFileLoader.Config = {
        ignoreNonExisting: true
    }
}

export namespace EnvFileLoader {
    export interface Config {
        ignoreNonExisting: boolean;
    }
}