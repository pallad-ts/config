import { ERRORS } from "../errors";

export function number(x: unknown) {
    const result = parseFloat(String(x));
    if (isNaN(result)) {
        throw ERRORS.CANNOT_CONVERT_TO_NUMBER.format(x);
    }
    return result;
}
