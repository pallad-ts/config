import * as is from "predicates";
import {URL} from "url";
import {ConfigError} from "./ConfigError";
import yn = require('yn');

export function string(x: unknown): string {
    return (String(x)).trim();
}

export function int(x: unknown) {
    const result = parseInt(x + '', 10);
    if (is.nan(result)) {
        throw new ConfigError(`Value "${x}" cannot be converted to Int`);
    }
    return result;
}

export function number(x: unknown) {
    const result = parseFloat(x + '');
    if (is.nan(result)) {
        throw new ConfigError(`Value "${x}" cannot be converted to Number`);
    }
    return result;
}

export function bool(x: unknown): boolean {
    const result = yn(x);
    if (result === undefined) {
        throw new ConfigError(`Value "${x}" cannot be converted to bool`);
    }
    return result;
}

export function url(options: url.Options = {}) {
    if (options.protocols) {
        options.protocols = options.protocols.map(x => x.toLowerCase());
    }

    return (x: any): string => {
        let url: URL;
        try {
            url = new URL(x);
        } catch (e) {
            throw new ConfigError(e.message);
        }

        if (options.protocols) {
            const protocol = url.protocol.replace(/:$/, '');
            if (!options.protocols.includes(protocol)) {
                throw new ConfigError(`Protocol "${protocol}" is not allowed. Allowed: ${options.protocols.join(', ')}`);
            }
        }
        return x;
    }
}

export namespace url {
    export interface Options {
        protocols?: string[];
    }
}
