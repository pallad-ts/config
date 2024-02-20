import { AsyncProvider, Provider, ValueNotAvailable } from "@pallad/config";
import { SecretReference } from "./SecretReference";
import DataLoader = require("dataloader");
import { fromPromise, left, right } from "@sweet-monads/either";
import { ERRORS } from "./errors";

export class SecretManagerProvider extends AsyncProvider<unknown> {
	constructor(
		readonly reference: SecretReference,
		readonly dataLoader: DataLoader<string, unknown | undefined>
	) {
		super();
	}

	resolveValueAsync(): Promise<Provider.Value<unknown>> {
		return this.loadValue().catch(e => left(e));
	}

	private async loadValue() {
		const value = await this.dataLoader.load(this.reference.secretName);

		if (value === undefined) {
			const description = SecretReference.computeDescription(this.reference);
			return left<Provider.Fail, unknown>(new ValueNotAvailable(description));
		}

		return this.extractValue(value);
	}

	private extractValue(value: unknown) {
		if (this.reference.property) {
			// eslint-disable-next-line no-null/no-null
			if (typeof value === "object" && value !== null) {
				const resolvedValue = (value as Record<string, unknown>)[this.reference.property];
				// eslint-disable-next-line no-null/no-null
				if (resolvedValue === undefined || resolvedValue === "" || resolvedValue === null) {
					const description = SecretReference.computeDescription(this.reference);
					return left(new ValueNotAvailable(description));
				}
				return right(resolvedValue);
			}
			return left(ERRORS.CANNOT_EXTRACT_PROPERTY_FROM_NON_OBJECT.create());
		}
		return right(value);
	}
}
