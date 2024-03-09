import { parse } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

import { runOnlyOnceWrapper } from "@pallad/config-common";

import { EnvFileProvider } from "./EnvFileProvider";
import { ERRORS } from "./errors";

export function envFileProviderFactory(
    options: envFileProviderFactory.Options
): envFileProviderFactory.ProviderFactory {
    function loadEnvFiles() {
        const envs: Record<string, string> = {};

        const cwd = options?.cwd ?? process.cwd();

        const paths = Array.isArray(options.paths) ? options.paths : [options.paths];

        for (const path of paths) {
            const resolvedPathData: envFileProviderFactory.PathEntryObject =
                typeof path === "string" ? { path: path, required: true } : path;

            const filePath = resolve(cwd, resolvedPathData.path);

            if (!existsSync(filePath)) {
                if (resolvedPathData.required) {
                    throw ERRORS.ENV_FILE_DOES_NOT_EXIST.create(resolvedPathData.path);
                }
                continue;
            }

            const result = parse(readFileSync(filePath, "utf-8"));
            Object.assign(envs, result);
        }

        return envs;
    }

    const loadEnvFilesOnce = runOnlyOnceWrapper(loadEnvFiles);

    const factory = ((key: string) => {
        return new EnvFileProvider(key, loadEnvFilesOnce);
    }) as unknown as envFileProviderFactory.ProviderFactory;

    factory.populateToEnv = (predicate?: envFileProviderFactory.PopulateToEnvPredicate) => {
        const envs = loadEnvFilesOnce();
        if (predicate) {
            for (const [key, value] of Object.entries(envs)) {
                if (predicate(key, value)) {
                    process.env[key] = value;
                }
            }
        } else {
            Object.assign(process.env, envs);
        }
    };

    factory.load = loadEnvFilesOnce;

    return factory;
}

export namespace envFileProviderFactory {
    export interface ProviderFactory {
        (key: string): EnvFileProvider;

        /**
         * Populates loaded values to process.env
         *
         * Accepts a predicate function that can be used to filter which values should be populated to process.env
         */
        populateToEnv(predicate?: PopulateToEnvPredicate): void;

        load(): Record<string, string>;
    }

    export interface Options {
        paths: PathEntry | PathEntry[];
        /**
         * Working directory. By default `process.cwd()`
         */
        cwd?: string;
    }

    export type PathEntry = string | PathEntryObject;

    export interface PathEntryObject {
        path: string;
        required: boolean;
    }

    export interface PopulateToEnvPredicate {
        (key: string, value: string): boolean;
    }
}
