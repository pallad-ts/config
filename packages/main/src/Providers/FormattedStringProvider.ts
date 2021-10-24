import {Provider} from "../Provider";

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

    async isAvailable(): Promise<boolean> {
        const results = await Promise.all(
            this.getDependencies()
                .map(x => x.isAvailable())
        );
        return results.every(x => x);
    }

    getDependencies(): Array<Provider<any>> {
        return this.values.filter(Provider.is);
    }

    async retrieveValue(): Promise<any> {
        const values = await Promise.all(
            this.values.map(x => Provider.is(x) ? x.getValue() : x)
        );
        return produce(this.strings, values);
    }

    static create(strings: readonly string[], ...values: any[]) {
        if (values.some(Provider.is)) {
            return new FormattedStringProvider(strings, values);
        }
        return produce(strings, values);
    }
}
