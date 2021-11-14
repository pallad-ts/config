import {ERRORS} from '../errors';
import {int} from './int';

function factory(options?: Port.Options) {
    const finalOptions: Required<Port.Options> = {
        registered: false,
        wellKnown: false,
        ephemeral: false,
        ...(options ?? {})
    };

    const ranges: Range[] = [];
    if (finalOptions.wellKnown) {
        ranges.push({
            description: 'well known',
            start: 1,
            end: 1023
        });
    }

    if (finalOptions.registered) {
        ranges.push({
            description: 'registered',
            start: 1024,
            end: 49151
        });
    }

    if (finalOptions.ephemeral) {
        ranges.push({
            description: 'ephemeral',
            start: 49152,
            end: 65535
        });
    }

    const description = ranges.length === 0 ? 'None, check your port type settings'
        : ranges.map(x => {
            return `${x.description} (${x.start}-${x.end})`
        }).join(', ');

    return (x: any): number => {
        const port = int(x);

        const isValid = ranges.some(x => x.start <= port && x.end >= port);

        if (!isValid) {
            throw ERRORS.INVALID_PORT_NUMBER.format(port, description);
        }

        return port;
    }
}

interface Range {
    description: string;
    start: number;
    end: number;
}

export interface Port {
    (value: any): number;

    options: typeof factory
}

export namespace Port {
    export interface Options {
        /**
         * whether to allow registered ports (1024-49151)
         */
        registered?: boolean;
        /**
         * whether to allow well known ports (1-1023)
         */
        wellKnown?: boolean;
        /**
         * whether to allow ephemeral ports (49152 - 65535)
         */
        ephemeral?: boolean
    }
}

export const port = (() => {
    const result = factory({
        wellKnown: true,
        registered: true,
    }) as any;
    result.options = factory;
    return result as Port;
})();
