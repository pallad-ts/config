import {Provider, ValueNotAvailable} from "@pallad/config";
import {SecretManagerConfigReference} from "./SecretManagerConfigReference";
import DataLoader = require("dataloader");
import {left, right} from '@sweet-monads/either'

export class SecretManagerProvider extends Provider<SecretManagerProvider.Value> {

	private cache?: Promise<Provider.Value<SecretManagerProvider.Value>>;

	constructor(readonly reference: SecretManagerConfigReference, readonly dataLoader: DataLoader<string, SecretManagerProvider.Value | undefined>) {
		super();
	}

	getValue(): Promise<Provider.Value<SecretManagerProvider.Value>> {
		if (!this.cache) {
			this.cache = this.dataLoader.load(this.reference.secretName)
				.then(value => {
					if (value === undefined) {
						const description = SecretManagerConfigReference.computeDescription(this.reference);
						return left<Provider.Fail, SecretManagerProvider.Value>(new ValueNotAvailable(description));
					}
					return this.extractValue(value);
				})
				.catch(x => {
					return left<Provider.Fail, SecretManagerProvider.Value>(x);
				});
		}
		return this.cache!;
	}

	private extractValue(value: SecretManagerProvider.Value) {
		if (this.reference.property) {
			if (typeof value === 'string') {
				return left(new Error('Cannot extract property from string'));
			}

			const resolvedValue = value[this.reference.property];

			if (resolvedValue === undefined || resolvedValue === '' || resolvedValue === null) {
				const description = SecretManagerConfigReference.computeDescription(this.reference);
				return left(new ValueNotAvailable(description));
			}

			return right(resolvedValue);
		}

		return right(value);
	}
}

export namespace SecretManagerProvider {
	export type Value = string | Record<string, unknown>;
}
