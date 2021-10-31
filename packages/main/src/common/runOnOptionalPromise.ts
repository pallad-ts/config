import {OptionalPromise} from '../utils';
import {isPromise} from './isPromise';

/**
 * @internal
 */
export function runOnOptionalPromise<T, TReturn>(value: OptionalPromise<T>, func: (value: T) => TReturn): TReturn {
    if (isPromise(value)) {
        return value.then(func) as any;
    }
    return func(value);
}
