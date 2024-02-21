import { OptionalPromise } from "@src/utils";
import { Provider } from "@src/Provider";
import { assertProviderResolvedValidation } from "./assertProviderResolvedValidation";
import { right } from "@sweet-monads/either";

export function assertProviderValue(isAsync: boolean, value: OptionalPromise<Provider.Value<any>>, successValue: any) {
    const expected = right(successValue);

    return assertProviderResolvedValidation(isAsync, value, expected);
}
