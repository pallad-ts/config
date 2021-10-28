import {ConfigError} from '../ConfigError';

export function url(options: url.Options = {}) {
    if (options.protocols) {
        options.protocols = options.protocols.map(x => x.toLowerCase());
    }

    return (x: any): string => {
        let url: URL;
        try {
            url = new URL(x);
        } catch (e: any) {
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
