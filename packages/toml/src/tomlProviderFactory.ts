import { all as mergeAll, Options as DeepMergeOptions } from "deepmerge";
import { existsSync, readFileSync } from "fs";
import { load as loadToml } from "js-toml";
import { resolve } from "path";

import { FilePathEntry, runOnlyOnceWrapper } from "@pallad/config-common";

import { TomlProvider } from "./TomlProvider";
import { ERRORS } from "./errors";

export function tomlProviderFactory(options: tomlProviderFactory.Options) {
    function loadConfig() {
        const cwd = options?.cwd ?? process.cwd();

        const files = Array.isArray(options.files) ? options.files : [options.files];
        const configList = [] as Array<Record<string, any>>;

        for (const filePathEntry of files) {
            const pathEntry = FilePathEntry.normalize(filePathEntry);

            const filePath = resolve(cwd, pathEntry.path);

            if (!existsSync(filePath)) {
                if (pathEntry.required) {
                    throw ERRORS.ENV_FILE_DOES_NOT_EXIST.create(pathEntry.path);
                }
                continue;
            }

            configList.push(loadToml(readFileSync(filePath, "utf-8")));
        }

        return mergeAll(configList, options.deepMerge) as Record<string, unknown>;
    }

    const load = runOnlyOnceWrapper(loadConfig);
    const factory = ((propertyPath: string) => {
        return new TomlProvider(propertyPath, loadConfig);
    }) as unknown as tomlProviderFactory.ProviderFactory;

    factory.load = load;
    return factory;
}

export namespace tomlProviderFactory {
    export interface ProviderFactory {
        (propertyPath: string): TomlProvider;

        load(): Record<string, unknown>;
    }

    export interface Options {
        files: FilePathEntry | FilePathEntry[];
        /**
         * Working directory. By default `process.cwd()`
         */
        cwd?: string;
        deepMerge?: DeepMergeOptions;
    }
}
