import {Either, left, right} from "@sweet-monads/either";

export function fromTry<L, R>(fn: () => R): Either<L, R> {
    try {
        return right(fn());
    } catch (e) {
        return left(e as L);
    }
}
