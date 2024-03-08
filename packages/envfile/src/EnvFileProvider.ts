import { left, right } from "@sweet-monads/either";
import { fromNullable, none, just } from "@sweet-monads/maybe";

import { Provider } from "@pallad/config";
import { ValueNotAvailable } from "@pallad/config";

export class EnvFileProvider extends Provider<string> {
    constructor(
        private key: string,
        private envFileConfigLoader: () => Record<string, string>
    ) {
        super();
    }

    getValue() {
        const config = this.envFileConfigLoader();
        return fromNullable(config[this.key])
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
