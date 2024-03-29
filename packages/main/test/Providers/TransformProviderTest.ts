import { TransformProvider } from "@src/.";
import * as sinon from "sinon";
import { assert, IsExact } from "conditional-type-checks";
import { OptionalPromise } from "@src/utils";
import { DummyProvider } from "../dummies/DummyProvider";
import { Provider } from "@src/Provider";
import { assertProviderValue } from "../common/assertProviderValue";
import { assertNotAvailable } from "../common/assertNotAvailable";
import { assertProviderError } from "../common/assertProviderError";

describe("TransformProvider", () => {
    const RAW_VALUE = { raw: "value" };
    const TRANSFORMED_VALUE = { transformed: "value" };

    function createTransformer(): TransformProvider.Transformer<typeof TRANSFORMED_VALUE> {
        return sinon.stub().returns(TRANSFORMED_VALUE);
    }

    describe.each([["sync"], ["async"]])("%s", desc => {
        const isAsync = desc.includes("async");

        it("types", () => {
            const transformer = createTransformer();
            const provider = new TransformProvider(
                new DummyProvider({ isAsync: isAsync, value: RAW_VALUE }),
                transformer
            );
            const value = provider.getValue();
            assert<IsExact<typeof value, OptionalPromise<Provider.Value<typeof TRANSFORMED_VALUE>>>>(true);
        });

        it("returns value transformed by transformer", async () => {
            const transformer = createTransformer();
            const provider = new TransformProvider(
                new DummyProvider({ isAsync: isAsync, value: RAW_VALUE }),
                transformer
            );

            const value = provider.getValue();
            await assertProviderValue(isAsync, value, TRANSFORMED_VALUE);

            sinon.assert.calledOnce(transformer as any);
            sinon.assert.calledWithExactly(transformer as any, sinon.match.same(RAW_VALUE));
        });

        it("forwards original error", async () => {
            const error = new Error("foo");
            const transformer = createTransformer();
            const provider = new TransformProvider(new DummyProvider({ isAsync: isAsync, error }), transformer);

            const value = provider.getValue();
            await assertProviderError(isAsync, value, error);

            sinon.assert.notCalled(transformer as any);
        });

        it("not available if provider is not available", () => {
            const transformer = createTransformer();
            const provider = new TransformProvider(
                new DummyProvider({ isAsync: isAsync, description: "test" }),
                transformer
            );

            return assertNotAvailable(isAsync, provider.getValue(), "test");
        });
    });
});
