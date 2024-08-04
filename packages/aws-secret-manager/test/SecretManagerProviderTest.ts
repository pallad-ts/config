import { CreateSecretCommand, PutSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { SecretManagerProvider } from "@src/SecretManagerProvider";
import { SecretReference } from "@src/SecretReference";
import { ERRORS } from "@src/errors";
import { secretManagerProviderFactory } from "@src/secretManagerProviderFactory";
import { left, right } from "@sweet-monads/either";
import { LocalstackContainer, StartedLocalStackContainer } from "@testcontainers/localstack";
import * as sinon from "sinon";

import { loadAsync, ValueNotAvailable } from "@pallad/config";
import "@pallad/errors-dev";

import DataLoader = require("dataloader");

describe("SecretManagerProvider", () => {
	let container: StartedLocalStackContainer;
	let secretsManagerClient: SecretsManagerClient;
	const PREFIX = "pallad-config-";

	const REF_WITHOUT_PROPERTY: SecretReference = { name: "foo" };
	const REF_WITH_PROPERTY: SecretReference = { name: "foo", property: "bar" };

	async function createValue(name: string, value: string) {
		const secret = await secretsManagerClient.send(
			new CreateSecretCommand({
				Name: PREFIX + name,
			})
		);

		await secretsManagerClient.send(
			new PutSecretValueCommand({
				SecretId: secret.ARN,
				SecretString: value,
			})
		);
	}

	beforeAll(async () => {
		container = await new LocalstackContainer("localstack/localstack:3.6.0").start();
		secretsManagerClient = new SecretsManagerClient({
			endpoint: container.getConnectionUri(),
		});

		await Promise.all([
			createValue(
				"json",
				JSON.stringify({
					foo: "bar",
					nested: {
						baz: "qux",
					},
				})
			),
			createValue("raw", "raw_string_secret_value"),
		]);
	}, 120000);

	afterAll(() => {
		return container.stop();
	});
	describe("without property", () => {
		it("should return value for provided secret name", async () => {
			const batchFunction = sinon.stub().resolves(["foo"]);
			const dataLoader = new DataLoader<string, string | undefined>(batchFunction);

			const provider = new SecretManagerProvider(REF_WITHOUT_PROPERTY, dataLoader);

			await expect(provider.getValue()).resolves.toEqual(right("foo"));
			sinon.assert.calledOnceWithExactly(batchFunction, [REF_WITHOUT_PROPERTY.name]);
		});

		it("returns ValueNotAvailable error if secret does not exist", () => {
			const dataLoader = new DataLoader<string, string | undefined>(() => Promise.resolve([undefined]));

			const provider = new SecretManagerProvider(REF_WITHOUT_PROPERTY, dataLoader);

			return expect(provider.getValue()).resolves.toEqual(
				left(new ValueNotAvailable(SecretReference.computeDescription(REF_WITHOUT_PROPERTY)))
			);
		});
	});

	describe("with property", () => {
		it("should return value for provided secret name and property", async () => {
			const batchFunction = sinon.stub().resolves([{ bar: "foo" }]);
			const dataLoader = new DataLoader<string, Record<string, string> | undefined>(batchFunction);

			const provider = new SecretManagerProvider(REF_WITH_PROPERTY, dataLoader);

			await expect(provider.getValue()).resolves.toEqual(right("foo"));
			sinon.assert.calledOnceWithExactly(batchFunction, [REF_WITH_PROPERTY.name]);
		});
		it("returns ValueNotAvailable error if property does not exist", () => {
			const dataLoader = new DataLoader<string, Record<string, string> | undefined>(() => Promise.resolve([{}]));

			const provider = new SecretManagerProvider(REF_WITH_PROPERTY, dataLoader);

			return expect(provider.getValue()).resolves.toEqual(
				left(new ValueNotAvailable(SecretReference.computeDescription(REF_WITH_PROPERTY)))
			);
		});

		it("fails to retrieve value from non object", async () => {
			const dataLoader = new DataLoader<string, string | undefined>(() => Promise.resolve(["string value"]));

			const provider = new SecretManagerProvider(REF_WITH_PROPERTY, dataLoader);

			const value = await provider.getValue();

			expect(value.value).toBeErrorWithCode(ERRORS.CANNOT_EXTRACT_PROPERTY_FROM_NON_OBJECT.code);
		});
	});

	it("integration", async () => {
		const client = new SecretsManagerClient({
			endpoint: container.getConnectionUri(),
		});

		const spy = sinon.spy(client, "send");

		const factory = secretManagerProviderFactory({
			prefix: PREFIX,
			client,
		});

		const config = {
			fullJson: factory({ name: "json" }),
			fromJson: factory({ name: "json", property: "foo" }),
			fromJsonNested: factory({ name: "json", property: "nested.baz" }),
			raw: factory({ name: "raw" }),
		};

		const loaded = loadAsync(config);

		await expect(loaded).resolves.toMatchSnapshot();

		sinon.assert.calledOnce(spy);
	});
});
