import {OptionalPromise} from '@src/utils';
import {Provider} from '@src/Provider';
import {Validation} from 'monet';
import {assertProviderResolvedValidation} from './assertProviderResolvedValidation';

export function assertProviderValue(
    isAsync: boolean,
    value: OptionalPromise<Provider.Value<any>>,
    successValue: any) {

    const expected = Validation.Success(successValue);

    return assertProviderResolvedValidation(isAsync, value, expected);
}
