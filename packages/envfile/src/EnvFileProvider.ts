import { Provider } from "@pallad/config";
import { ValueNotAvailable } from "@pallad/config/compiled/ValueNotAvailable";
import { fromNullable, none, just } from "@sweet-monads/maybe";
import { left, right } from "@sweet-monads/either";

export class EnvFileProvider extends Provider<string> {
    constructor(
        private key: string,
        private envFileVars: Record<string, string>
    ) {
        super();
    }

    getValue() {
        return fromNullable(this.envFileVars[this.key])
            .chain(value => (value === "" ? none() : just(value)))
            .fold(
                () => {
                    return left(new ValueNotAvailable(`"${this.key}" from ENV file(s)`));
                },
                result => {
                    return right(result);
                }
            );
    }
}
