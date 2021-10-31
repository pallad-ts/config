import {OptionalPromise} from '@src/utils';
import {Provider} from '@src/Provider';
import {Validation} from 'monet';
import {assertProviderResolvedValidation} from './assertProviderResolvedValidation';

export function assertProviderError(
    isAsync: boolean,
    value: OptionalPromise<Provider.Value<any>>,
    error: any) {

    const expected = Validation.Fail(error);

    return assertProviderResolvedValidation(isAsync, value, expected);
}
