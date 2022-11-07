import {Provider} from "@pallad/config";
import {ValueNotAvailable} from '@pallad/config/compiled/ValueNotAvailable';
import {fromNullable, none, just} from '@sweet-monads/maybe';
import {left, right} from '@sweet-monads/either';

export class EnvFileProvider extends Provider<string> {
    constructor(private key: string,
                private envFileVars: Record<string, string>) {
        super();
    }

    getValue() {
        const result = fromNullable(this.envFileVars[this.key])
            .chain(value => value === '' ? none() : just(value));

        return result.isNone() ? left(new ValueNotAvailable(`"${this.key}" from ENV file(s)`)) : right(result.value);
    }
}
