import { fromTry, left, right } from "@sweet-monads/either";
import { fromNullable } from "@sweet-monads/maybe";
import { get } from "object-path";

import { Provider, ValueNotAvailable } from "@pallad/config";

export class TomlProvider extends Provider<unknown> {
    constructor(
        readonly propertyPath: string,
        readonly configFactory: () => Record<string, unknown>
    ) {
        super();
    }

    getValue(): Provider.Value<unknown> {
        return fromTry<Provider.Fail, Record<string, unknown>>(this.configFactory).chain(config => {
            return fromNullable(get(config, this.propertyPath)).fold(
                () => {
                    return left(new ValueNotAvailable(`TOML Config at property path: ${this.propertyPath}`));
                },
                (value: unknown) => right(value)
            );
        });
    }
}
