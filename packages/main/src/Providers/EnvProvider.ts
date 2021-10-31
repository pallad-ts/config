import {Provider} from "../Provider";
import {Maybe, Validation} from 'monet';
import {ValueNotAvailable} from '../ValueNotAvailable';

export class EnvProvider extends Provider<string> {
    constructor(private key: string,
                private envs: typeof process['env'] = process.env) {
        super();
    }

    getValue(): Provider.Value<string> {
        return Maybe.fromUndefined(this.envs[this.key])
            .filter(value => value !== '')
            .toValidation(
                new ValueNotAvailable('ENV: ' + this.key)
            );
    }
}
