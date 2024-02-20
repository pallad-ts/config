import {SSMClient} from "@aws-sdk/client-ssm";
import {SecretManagerProvider} from "./SecretManagerProvider";
import DataLoader = require("dataloader");

export function secretManagerProviderFactory() {

}

export namespace secretManagerProviderFactory {
	export interface Options {
		ssm?: SSMClient;
		createDataLoader?: CreateDataLoader;
		prefix?: string;
		deserialize?: (value: string) => unknown;
	}

	export type CreateDataLoader = (batchFn: BatchFunction) => DataLoader<string, SecretManagerProvider.Value | undefined>
	export type BatchFunction = (key: readonly string[]) => Promise<Array<SecretManagerProvider.Value | undefined>>;
}
