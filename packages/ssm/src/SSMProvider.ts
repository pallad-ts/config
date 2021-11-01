import {Provider, ValueNotAvailable} from '@pallad/config';
import {DataLoader} from './index';
import {Validation} from 'monet';

export class SSMProvider extends Provider<SSMProvider.Value> {

    private cache?: Promise<Provider.Value<SSMProvider.Value>>;

    constructor(private key: string,
                private dataLoader: DataLoader<string, SSMProvider.Value | undefined>) {
        super()
    }

    getValue(): Promise<Provider.Value<SSMProvider.Value>> {
        if (!this.cache) {
            this.cache = this.dataLoader.load(this.key)
                .then(value => {
                    if (value === undefined) {
                        return Validation.Fail<Provider.Fail, SSMProvider.Value>(new ValueNotAvailable(`SSM: ${this.key}`));
                    }
                    return Validation.Success<Provider.Fail, SSMProvider.Value>(value);
                })
                .catch(x => {
                    return Validation.Fail<Provider.Fail, SSMProvider.Value>(x);
                });
        }
        return this.cache!;
    }
}

export namespace SSMProvider {
    export type Value = string | string[];
}