import {Provider} from "../Provider";
import {ValueNotAvailable} from '../ValueNotAvailable';
import {fromNullable, just, none} from "@sweet-monads/maybe";
import {left, right} from "@sweet-monads/either";

export class EnvProvider extends Provider<string> {
    constructor(private key: string,
                private envs: typeof process['env'] = process.env) {
        super();
    }

    getValue(): Provider.Value<string> {
        const value = fromNullable(this.envs[this.key])
            .chain(value => value === '' ? none() : just(value));

        return value.isNone() ? left(new ValueNotAvailable('ENV: ' + this.key)) : right(value.value);
    }
}
