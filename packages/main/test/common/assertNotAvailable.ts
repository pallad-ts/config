import {OptionalPromise} from '@src/utils';
import {Provider} from '@src/Provider';
import {Validation} from 'monet';
import {ValueNotAvailable} from '@src/ValueNotAvailable';

export function assertNotAvailable(
    isAsync: boolean,
    value: OptionalPromise<Provider.Value<any>>,
    description: string): any {
    const expected = Validation.Fail(
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
