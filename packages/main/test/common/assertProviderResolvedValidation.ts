import {OptionalPromise} from '@src/utils';
import {Provider} from '@src/Provider';
import {Validation} from 'monet';

export function assertProviderResolvedValidation(
    isAsync: boolean,
    value: OptionalPromise<Provider.Value<any>>,
    expected: Validation<any, any>
): any {
    return (isAsync ? expect(value).resolves : expect(value))
        .toStrictEqual(expected);
}
