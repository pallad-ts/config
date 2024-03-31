import { SecretsManagerClient, BatchGetSecretValueCommand, SecretValueEntry } from "@aws-sdk/client-secrets-manager";
import { fromTry } from "@sweet-monads/either";
// eslint-disable-next-line @typescript-eslint/naming-convention
import DataLoader from "dataloader";



import { SecretManagerProvider } from "./SecretManagerProvider";
import { SecretReference } from "./SecretReference";
import { ERRORS } from "./errors";


const MAX_BATCH_SIZE = 20;

function defaultCreateDataLoader(batchFN: secretManagerProviderFactory.BatchFunction) {
	return new DataLoader<string, unknown | undefined>(batchFN, {
		maxBatchSize: MAX_BATCH_SIZE,
	});
}

export function defaultDeserialize(entry: SecretValueEntry) {
	if (entry.SecretBinary) {
		return entry.SecretBinary;
	}

	if (entry.SecretString) {
		return fromTry(() => JSON.parse(entry.SecretString!)).fold(
			() => {
				return entry.SecretString!;
			},
			x => x
		);
	}

	throw new Error("Unsupported secret. Missing required `SecretBinary` or `SecretString` field.");
}

export function secretManagerProviderFactory({
	client = new SecretsManagerClient(),
	prefix,
	createDataLoader,
	deserialize = defaultDeserialize,
}: secretManagerProviderFactory.Options = {}) {
	const batchFn = async (keys: readonly string[]) => {
		if (keys.length > MAX_BATCH_SIZE) {
			throw ERRORS.MISCONFIGURED_DATALOADER.create(MAX_BATCH_SIZE);
		}
		const map = new Map<string, unknown>();
		const result = await client.send(
			new BatchGetSecretValueCommand({
				SecretIdList: keys.slice(),
			})
		);

		if (result.SecretValues) {
			for (const secretValue of result.SecretValues) {
				map.set(secretValue.Name!, deserialize(secretValue));
			}
		}
		return keys.map(x => map.get(x));
	};

	const dataLoader = (createDataLoader ?? defaultCreateDataLoader)(batchFn);
	return (reference: SecretReference) => {
		return new SecretManagerProvider(
			{
				name: (prefix ?? "") + reference.name,
				property: reference.property,
			},
			dataLoader
		);
	};
}

export namespace secretManagerProviderFactory {
	export interface Options {
		client?: SecretsManagerClient;
		createDataLoader?: CreateDataLoader;
		prefix?: string;
		deserialize?: (entry: SecretValueEntry) => unknown;
	}

	export type CreateDataLoader = (batchFn: BatchFunction) => DataLoader<string, unknown | undefined>;
	export type BatchFunction = (key: readonly string[]) => Promise<Array<unknown | undefined>>;
}
