import {Provider} from "@pallad/config";
import {ValueNotAvailable} from '@pallad/config/compiled/ValueNotAvailable';
import {Maybe} from 'monet';

export class EnvFileProvider extends Provider<string> {
    constructor(private key: string,
                private envFileVars: Record<string, string>) {
        super();
    }

    getValue() {
        return Maybe.fromUndefined(this.envFileVars[this.key])
            .filter(value => value !== '')
            .toValidation(
                new ValueNotAvailable(`"${this.key}" from ENV file(s)`)
            );
    }
}
