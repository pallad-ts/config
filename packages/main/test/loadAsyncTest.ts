import { ERRORS } from "@src/errors";
import { loadAsync } from "@src/loadAsync";
import { left, right } from "@sweet-monads/either";

import "@pallad/errors-dev";

import { DummyProvider } from "./dummies/DummyProvider";

describe("loadAsync", () => {
    it("loads config", () => {
        const input = {
            foo: DummyProvider.async({ value: "foo" }),
            nested: {
                bar: DummyProvider.async({ value: "bar" }),
            },
        };

        const config = loadAsync(input);
        expect(config).resolves.toStrictEqual({
            foo: "foo",
            nested: {
                bar: "bar",
            },
        });
    });

    describe("fails", () => {
        it("if some of providers are not available", async () => {
            const result = await loadAsync({
                foo: new DummyProvider({ isAsync: true, description: "foo desc" }),
            })
                .then(right)
                .catch(left);
            expect(result.value).toBeErrorWithCode(ERRORS.CONFIG_LOADING_FAILED);

            expect(result.value).toHaveProperty("errorList", [ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.create("foo desc")]);
        });

        it("if some of providers fail", async () => {
            const error = new Error("test");
            const result = await loadAsync({
                foo: new DummyProvider({ isAsync: true, error }),
            })
                .then(right)
                .catch(left);
            expect(result.value).toBeErrorWithCode(ERRORS.CONFIG_LOADING_FAILED);

            expect(result.value).toHaveProperty("errorList", [error]);
        });

        it("if some of providers fails with multiple errors", async () => {
            const error1 = new Error("test");
            const error2 = new Error("e2");
            const error3 = new Error("e3");
            const error4 = new Error("e4");

            const result = await loadAsync({
                foo: new DummyProvider({ isAsync: true, error: [error1, error2] }),
                var: new DummyProvider({ isAsync: true, error: [error3, error4] }),
            })
                .then(right)
                .catch(left);

            expect(result.value).toBeErrorWithCode(ERRORS.CONFIG_LOADING_FAILED);

            expect(result.value).toHaveProperty("errorList", [error1, error2, error3, error4]);
        });
    });
});
