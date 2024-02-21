import { ERRORS } from "../errors";

export function int(x: unknown) {
    const result = parseInt(String(x), 10);
    if (isNaN(result)) {
        throw ERRORS.CANNOT_CONVERT_TO_INT.format(x);
    }
    return result;
}
