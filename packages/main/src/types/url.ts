import { fromTry, left, right } from "@sweet-monads/either";

import { ConfigError } from "../ConfigError";
import { ERRORS } from "../errors";

function factory(options?: { protocols?: string[] | string }) {
    const finalOptions: { protocols: string[] | undefined } = {
        protocols: undefined,
    };

    if (options?.protocols) {
        finalOptions.protocols = (Array.isArray(options.protocols) ? options.protocols : [options.protocols]).map(x =>
            x.toLowerCase()
        );
    }

    return (x: unknown): string => {
        return fromTry<Error, URL>(() => {
            return new URL((x as string) + "");
        })
            .mapLeft(e => new ConfigError(e.message))
            .chain(url => {
                if (finalOptions.protocols) {
                    const protocol = url.protocol.replace(/:$/, "");
                    if (!finalOptions.protocols.includes(protocol)) {
                        return left(ERRORS.TYPE_URL_INVALID_PROTOCOL.create(protocol, finalOptions.protocols));
                    }
                }

                return right(x as string);
            })
            .unwrap(e => e);
    };
}

export interface Url {
    (value: unknown): string;

    options: typeof factory;
}

export const url = (() => {
    const result = factory() as any;
    result.options = factory;
    return result as Url;
})();
