import {Provider} from "../Provider";
import {OptionalPromise} from '../utils';
import {isPromise} from '../common/isPromise';

function produce(strings: readonly string[], values: any[]) {
    let str = '';
    for (const [index, string] of strings.entries()) {
        str += `${string}${(values[index] || '')}`;
    }
    return str;
}

export class FormattedStringProvider extends Provider<string> {
    constructor(private strings: readonly string[], private values: any[]) {
        super();
    }

    getDescription(): string {
        const desc = produce(this.strings, this.values.map(x => Provider.is(x) ? `\${${x.getDescription()}}` : x));
        return `Formatted string ("${desc}")`;
    }

    isAvailable(): OptionalPromise<boolean> {
        const providersAvailability = this.getDependentProviders().map(x => x.isAvailable());
        const hasPromises = providersAvailability.some(isPromise);
        if (hasPromises) {
            return Promise.all(providersAvailability)
                .then(x => {
                    return x.every(x => x);
                })
        }
        return providersAvailability.every(x => x);
    }

    getDependentProviders(): Array<Provider<any>> {
        return this.values.filter(Provider.is);
    }

    retrieveValue(): OptionalPromise<string> {
        const values = this.values.map(x => Provider.is(x) ? x.getValue() : x)

        const hasPromises = values.some(isPromise);
        if (hasPromises) {
            return Promise.all(values)
                .then(x => {
                    return produce(this.strings, x);
                })
        }
        return produce(this.strings, values);
    }

    static create(strings: readonly string[], ...values: any[]) {
        if (values.some(Provider.is)) {
            return new FormattedStringProvider(strings, values);
        }
        return produce(strings, values);
    }
}
