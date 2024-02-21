import { OptionalPromise } from "@src/utils";
import { Provider } from "@src/Provider";
import { assertProviderResolvedValidation } from "./assertProviderResolvedValidation";
import { left } from "@sweet-monads/either";

export function assertProviderError(isAsync: boolean, value: OptionalPromise<Provider.Value<any>>, error: any) {
    const expected = left(error);

    return assertProviderResolvedValidation(isAsync, value, expected);
}
