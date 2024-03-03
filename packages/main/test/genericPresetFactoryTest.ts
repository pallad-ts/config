import { FirstAvailableProvider } from "@src/Providers";
import { genericPresetFactory } from "@src/genericPresetFactory";
import { assert, IsExact } from "conditional-type-checks";

import { DummyProvider } from "./dummies/DummyProvider";

describe("genericPresetFactory", () => {
    const PROVIDER_NUMBER = DummyProvider.sync({ value: 10 });
    const PROVIDER_STRING = DummyProvider.sync({ value: "test" });

    describe("returns function that creates FirstAvailableProvider instance", () => {
        const preset = genericPresetFactory(function* (type: "string" | "number") {
            if (type === "string") {
                yield PROVIDER_STRING;
            } else {
                yield PROVIDER_NUMBER;
            }
        });

        it("test", () => {
            const firstProvider = preset("string");
            const secondProvider = preset("number");
            expect(firstProvider).toBeInstanceOf(FirstAvailableProvider);
            expect(firstProvider.providers).toEqual([PROVIDER_STRING]);

            expect(secondProvider).toBeInstanceOf(FirstAvailableProvider);
            expect(firstProvider.providers).toEqual([PROVIDER_NUMBER]);
        });

        it("types", () => {
            type Input = ReturnType<typeof preset>;
            type Expected = FirstAvailableProvider<Array<DummyProvider<string> | DummyProvider<number>>>;
            assert<IsExact<Input, Expected>>(true);
        });
    });

    it("calls the generator with the provided arguments", () => {
        const providerGenerator = jest.fn(() => [1, 2, 3]);

        const factory = genericPresetFactory(providerGenerator);

        factory("foo", "bar");

        expect(providerGenerator).toHaveBeenCalledWith("foo", "bar");
    });
});
