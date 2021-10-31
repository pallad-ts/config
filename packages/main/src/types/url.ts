import {ConfigError} from '../ConfigError';
import {ERRORS} from '../errors';


function factory(options?: { protocols?: string[] | string }) {
    const finalOptions: { protocols: string[] | undefined } = {
        protocols: undefined
    };

    if (options?.protocols) {
        finalOptions.protocols = (Array.isArray(options.protocols) ? options.protocols : [options.protocols])
            .map(x => x.toLowerCase());
    }

    return (x: any): string => {
        let url: URL;
        try {
            url = new URL(x);
        } catch (e: any) {
            throw new ConfigError(e.message);
        }

        if (finalOptions.protocols) {
            const protocol = url.protocol.replace(/:$/, '');
            if (!finalOptions.protocols.includes(protocol)) {
                throw ERRORS.TYPE_URL_INVALID_PROTOCOL.format(
                    protocol,
                    finalOptions.protocols.join(', ')
                );
            }
        }
        return x;
    }
}

export interface Url {
    (value: any): string

    options: typeof factory
}

export const url = (() => {
    const result = factory() as any;
    result.options = factory;
    return result as Url;
})();
