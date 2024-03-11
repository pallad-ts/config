import { fromTry, left, right } from "@sweet-monads/either";
import { parse, Duration, toSeconds } from "iso8601-duration";

import { Less, Greater, Equal, Result } from "@pallad/compare";
import { enchant, Range, Enchanted } from "@pallad/range";

import { ERRORS } from "../errors";

function durationComparator(a: Duration, b: Duration): Result {
    const aInSeconds = toSeconds(a);
    const bInSeconds = toSeconds(b);
    if (aInSeconds > bInSeconds) {
        return Greater;
    } else if (aInSeconds < bInSeconds) {
        return Less;
    }
    return Equal;
}

function factory(options: duration.Options = {}) {
    const input = [
        options.min ? toDuration(options.min) : undefined,
        options.max ? toDuration(options.max) : undefined,
    ];

    let range: Enchanted<Duration> | undefined;

    if (options.min || options.max) {
        range = enchant(Range.fromArray(input as Duration[], durationComparator), durationComparator);
    }

    return (value: unknown): Duration => {
        return fromTry<Error, Duration>(() => parse((value as string) + ""))
            .mapLeft(e => ERRORS.CANNOT_CONVERT_TO_DURATION.create(value, e.message))
            .chain(duration => {
                if (range && !range.isWithin(duration)) {
                    return left(ERRORS.DURATION_INVALID_VALUE_IN_RANGE.create(duration, range));
                }

                return right(duration);
            })
            .unwrap(e => e);
    };
}

export const duration = (() => {
    const result = factory() as duration.Factory;
    result.options = factory;
    return result;
})();

function toDuration(value: string | Duration): Duration {
    return typeof value === "string" ? parse(value) : value;
}

export namespace duration {
    export interface Factory extends Converter {
        options(options: Options): Converter;
    }

    export interface Options {
        min?: string | Duration;
        max?: string | Duration;
    }

    export interface Converter {
        (value: unknown): Duration;
    }
}
