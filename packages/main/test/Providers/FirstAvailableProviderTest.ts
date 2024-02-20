import { assert, IsExact } from "conditional-type-checks";
import { FirstAvailableProvider } from "@src/Providers";
import { DummyProvider } from "../dummies/DummyProvider";
import { OptionalPromise } from "@src/utils";
import { Provider } from "@src/Provider";
import { assertProviderValue } from "../common/assertProviderValue";
import { assertNotAvailable } from "../common/assertNotAvailable";
import { assertProviderError } from "../common/assertProviderError";

describe("FirstAvailableProvider", () => {
    it("types", () => {
        const provider = new FirstAvailableProvider(
            DummyProvider.sync<"foo">({ value: "foo" }),
            DummyProvider.sync<"bar">({ value: "bar" })
        );

        const value = provider.getValue();
        assert<IsExact<typeof value, OptionalPromise<Provider.Value<"foo" | "bar">>>>(true);
    });

    describe.each<[string, string, string]>([
        ["sync", "sync", "sync"],
        ["sync", "sync", "async"],
        ["sync", "async", "sync"],
        ["sync", "async", "async"],
        ["async", "sync", "sync"],
        ["async", "sync", "async"],
        ["async", "async", "sync"],
        ["async", "async", "async"],
    ])("%s + %s + %s", (first, second, third) => {
        const isFirstAsync = first === "async";
        const isSecondAsync = second === "async";
        const isThirdAsync = third === "async";

        const VALUE_1 = "foo" as const;
        const VALUE_2 = "bar" as const;
        const VALUE_3 = "baz" as const;

        const firstProvider = new DummyProvider({
            value: VALUE_1,
            isAsync: isFirstAsync,
            description: "prov 1",
        });
        const secondProvider = new DummyProvider({
            value: VALUE_2,
            isAsync: isSecondAsync,
            description: "prov 2",
        });
        const thirdProvider = new DummyProvider({
            value: VALUE_3,
            isAsync: isThirdAsync,
            description: "prov 3",
        });

        it("not available if all of providers are not available", () => {
            const provider = new FirstAvailableProvider(
                new DummyProvider({ isAsync: isFirstAsync, description: "prov 1" }),
                new DummyProvider({ isAsync: isSecondAsync, description: "prov 2" }),
                new DummyProvider({ isAsync: isThirdAsync, description: "prov 3" })
            );

            return assertNotAvailable(
                isFirstAsync || isSecondAsync || isThirdAsync,
                provider.getValue(),
                "First available: prov 1, prov 2, prov 3"
            );
        });

        describe("forwards errors for first provider that fails", () => {
            const error = new Error("foo");
            it("first failure", () => {
                const provider = new FirstAvailableProvider(
                    new DummyProvider({ isAsync: isFirstAsync, error }),
                    secondProvider,
                    thirdProvider
                );

                return assertProviderError(isFirstAsync, provider.getValue(), error);
            });

            it("second failure", () => {
                const provider = new FirstAvailableProvider(
                    new DummyProvider({ isAsync: isFirstAsync }),
                    new DummyProvider({ isAsync: isSecondAsync, error }),
                    thirdProvider
                );

                return assertProviderError(isFirstAsync || isSecondAsync, provider.getValue(), error);
            });

            it("third failure", () => {
                const provider = new FirstAvailableProvider(
                    new DummyProvider({ isAsync: isFirstAsync }),
                    new DummyProvider({ isAsync: isSecondAsync }),
                    new DummyProvider({ isAsync: isThirdAsync, error })
                );

                return assertProviderError(isFirstAsync || isSecondAsync || isThirdAsync, provider.getValue(), error);
            });
        });

        describe("returns value of first available provider", () => {
            it("first available", () => {
                const provider = new FirstAvailableProvider(firstProvider, secondProvider, thirdProvider);

                return assertProviderValue(isFirstAsync, provider.getValue(), VALUE_1);
            });

            it("second available", () => {
                const provider = new FirstAvailableProvider(
                    new DummyProvider({ isAsync: isFirstAsync }),
                    secondProvider,
                    thirdProvider
                );

                return assertProviderValue(isFirstAsync || isSecondAsync, provider.getValue(), VALUE_2);
            });

            it("third available", () => {
                const provider = new FirstAvailableProvider(
                    new DummyProvider({ isAsync: isFirstAsync }),
                    new DummyProvider({ isAsync: isSecondAsync }),
                    thirdProvider
                );

                return assertProviderValue(isFirstAsync || isSecondAsync || isThirdAsync, provider.getValue(), VALUE_3);
            });
        });
    });
});
