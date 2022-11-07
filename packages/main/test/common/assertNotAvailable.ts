import {OptionalPromise} from '@src/utils';
import {Provider} from '@src/Provider';
import {ValueNotAvailable} from '@src/ValueNotAvailable';
import {left} from "@sweet-monads/either";

export function assertNotAvailable(
    isAsync: boolean,
    value: OptionalPromise<Provider.Value<any>>,
    description: string): any {
    const expected = left(
        new ValueNotAvailable(description)
    );
    if (isAsync) {
        return expect(value)
            .resolves
            .toEqual(expected);
    }
    expect(value)
        .toEqual(expected);
}
