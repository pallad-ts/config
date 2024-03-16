import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { SecretManagerProvider } from "@src/SecretManagerProvider";
import { SecretReference } from "@src/SecretReference";
import { ERRORS } from "@src/errors";
import { secretManagerProviderFactory } from "@src/secretManagerProviderFactory";
import { left, right } from "@sweet-monads/either";
import * as sinon from "sinon";

import { loadAsync, ValueNotAvailable } from "@pallad/config";
import "@pallad/errors-dev";

import DataLoader = require("dataloader");

describe("SecretManagerProvider", () => {
	const REF_WITHOUT_PROPERTY = { secretName: "foo" };
	const REF_WITH_PROPERTY = { secretName: "foo", property: "bar" };

	describe("without property", () => {
		it("should return value for provided secret name", async () => {
			const batchFunction = sinon.stub().resolves(["foo"]);
			const dataLoader = new DataLoader<string, string | undefined>(batchFunction);

			const provider = new SecretManagerProvider(REF_WITHOUT_PROPERTY, dataLoader);

			await expect(provider.getValue()).resolves.toEqual(right("foo"));
			sinon.assert.calledOnceWithExactly(batchFunction, [REF_WITHOUT_PROPERTY.secretName]);
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
			sinon.assert.calledOnceWithExactly(batchFunction, [REF_WITH_PROPERTY.secretName]);
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

	it("integration", () => {
		const factory = secretManagerProviderFactory({
			prefix: "pallad-config-",
		});

		const config = {
			fullJson: factory({ secretName: "json" }),
			fromJson: factory({ secretName: "json", property: "foo" }),
			fromJsonNested: factory({ secretName: "json", property: "nested.baz" }),
			raw: factory({ secretName: "raw" }),
		};

		const loaded = loadAsync(config);

		return expect(loaded).resolves.toMatchSnapshot();
	});
});
