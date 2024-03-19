import { Either, left, right } from "@sweet-monads/either";
import * as is from "predicates";

export async function validateConfigSource(config: unknown): Promise<Either<Error, unknown>> {
    if (config instanceof Function) {
        return validateConfigShape(await config());
    }

    return validateConfigShape(config);
}

function validateConfigShape(shape: unknown): Either<Error, unknown> {
    if (is.function(shape)) {
        return left(new Error("Configuration shape must be an object, primitive or array. Got " + typeof shape));
    }

    if (shape === undefined) {
        return left(new Error("No configuration found"));
    }

    return right(shape);
}
