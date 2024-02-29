import type { Printer, Config, Refs } from "pretty-format";

import { Secret } from "@pallad/secret";

const serializer = {
    serialize(val: Secret<unknown>, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) {
        return `**Secret value: ${printer(val.getValue(), config, indentation, depth, refs)} **`;
    },

    test(val: unknown) {
        return Secret.is(val);
    },
};
// eslint-disable-next-line import/no-default-export
export = serializer;
