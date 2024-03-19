import { Either, fromPromise } from "@sweet-monads/either";
import { realpath } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { validateConfigSource } from "./validateConfigSource";

export async function resolveConfigShape(options: resolveConfigShape.Options): Promise<Either<Error, unknown>> {
    return (await fromPromise<Error, unknown>(loadModule(options.filePath))).asyncChain(module => {
        return validateConfigSource(extractConfigFromModule(module, options.moduleConfigProperty));
    });
}

export namespace resolveConfigShape {
    export interface Options {
        filePath: string;
        moduleConfigProperty?: string;
    }
}

// this is highly inspired from https://github.com/cosmiconfig/cosmiconfig/blob/main/src/loaders.ts
async function loadModule(modulePath: string) {
    const realModulePath = await realpath(modulePath);
    try {
        const fileUrl = pathToFileURL(realModulePath);
        return await import(fileUrl.href);
    } catch (error) {
        try {
            return require(realModulePath);
        } catch (requireError: unknown) {
            if (
                (requireError instanceof Error && (requireError as any).code === "ERR_REQUIRE_ESM") ||
                (requireError instanceof SyntaxError &&
                    requireError.toString().includes("Cannot use import statement outside a module"))
            ) {
                throw error;
            }

            throw requireError;
        }
    }
}

function extractConfigFromModule(module: any, property?: string) {
    if (property) {
        return module[property];
    }
    if (module instanceof Function) {
        return module;
    }
    if ("default" in module) {
        return module.default;
    }
}
