import { OptionalPromise } from "@src/utils";
import { Provider } from "@src/Provider";
import { Either } from "@sweet-monads/either";

export function assertProviderResolvedValidation(
    isAsync: boolean,
    value: OptionalPromise<Provider.Value<any>>,
    expected: Either<any, any>
): any {
    return (isAsync ? expect(value).resolves : expect(value)).toStrictEqual(expected);
}
