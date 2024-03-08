import { parse } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

import { runOnlyOnceWrapper } from "@pallad/config-common";

import { EnvFileProvider } from "./EnvFileProvider";
import { ERRORS } from "./errors";

export function envFileProviderFactory(options: envFileProviderFactory.Options) {
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

        if (options?.populateToEnv) {
            if (typeof options.populateToEnv === "function") {
                for (const [key, value] of Object.entries(envs)) {
                    if (options.populateToEnv(key, value)) {
                        process.env[key] = value;
                    }
                }
            } else if (options.populateToEnv) {
                Object.assign(process.env, envs);
            }
        }

        return envs;
    }

    return (key: string) => new EnvFileProvider(key, runOnlyOnceWrapper(loadEnvFiles));
}

export namespace envFileProviderFactory {
    export interface Options {
        paths: PathEntry | PathEntry[];
        /**
         * Working directory. By default `process.cwd()`
         */
        cwd?: string;
        /**
         * Whether to populate loaded values to process.env. Default: false
         */
        populateToEnv?: boolean | PopulateToEnvPredicate;
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
