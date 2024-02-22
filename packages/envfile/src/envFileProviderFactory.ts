import { parse } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

import { EnvFileProvider } from "./EnvFileProvider";
import { ERRORS } from "./errors";

export function envFileProviderFactory(options: envFileProviderFactory.Options) {
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
        Object.assign(process.env, envs);
    }

    return (key: string) => new EnvFileProvider(key, envs);
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
        populateToEnv?: boolean;
    }

    export type PathEntry = string | PathEntryObject;

    export interface PathEntryObject {
        path: string;
        required: boolean;
    }
}
