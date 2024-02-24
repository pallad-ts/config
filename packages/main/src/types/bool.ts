import yn from "yn";

import { ERRORS } from "../errors";

export function bool(x: unknown): boolean {
    const result = yn(x);
    if (result === undefined) {
        throw ERRORS.CANNOT_CONVERT_TO_BOOL.create(String(x));
    }
    return result;
}
