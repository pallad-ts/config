import { left, right } from "@sweet-monads/either";
// eslint-disable-next-line @typescript-eslint/naming-convention
import DataLoader from "dataloader";

import { AsyncProvider, Provider, ValueNotAvailable } from "@pallad/config";

export class SSMProvider extends AsyncProvider<SSMProvider.Value> {
    constructor(
        private key: string,
        private dataLoader: DataLoader<string, SSMProvider.Value | undefined>
    ) {
        super();
    }

    resolveValueAsync(): Promise<Provider.Value<SSMProvider.Value>> {
        return this.dataLoader
            .load(this.key)
            .then(value => {
                if (value === undefined) {
                    return left<Provider.Fail, SSMProvider.Value>(new ValueNotAvailable(`SSM: ${this.key}`));
                }
                return right<Provider.Fail, SSMProvider.Value>(value);
            })
            .catch(x => {
                return left<Provider.Fail, SSMProvider.Value>(x);
            });
    }
}

export namespace SSMProvider {
    export type Value = string | string[];
}
