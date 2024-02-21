import { assert, IsExact } from "conditional-type-checks";
import { DummyProvider } from "../dummies/DummyProvider";
import { PickByTypeProvider } from "@src/Providers/PickByTypeProvider";
import { OptionalPromise } from "@src/utils";
import { assertNotAvailable } from "../common/assertNotAvailable";
import { assertProviderError } from "../common/assertProviderError";
import { ERRORS } from "@src/errors";
import { Provider } from "@src/Provider";
import { assertProviderResolvedValidation } from "../common/assertProviderResolvedValidation";
import { ValueNotAvailable } from "@src/ValueNotAvailable";
import { left } from "@sweet-monads/either";

describe("PickByTypeProvider", () => {
    const TYPE_1 = "foo";
    const TYPE_2 = "bar";

    const OPTIONS_1 = {
        foo: "bar",
    } as const;

    const OPTIONS_2 = {
        bar: "baz",
    } as const;

    describe("registering", () => {
        it("fails if register type that is already registered", () => {
            expect(() => {
                PickByTypeProvider.create(DummyProvider.sync({ value: "test" }))
                    .registerOptions("foo", "foo")
                    .registerOptions("foo", "bar");
            }).toThrowErrorMatchingSnapshot();
        });
    });

    describe.each([
        ["sync", "sync"],
        ["sync", "async"],
        ["async", "sync"],
        ["async", "async"],
    ])("type %s options %s", (typeType, optionsType) => {
        const isTypeAsync = typeType === "async";
        const areOptionsAsync = optionsType === "async";

        const typeProvider1 = new DummyProvider({ isAsync: isTypeAsync, value: "foo" });
        const typeProvider2 = new DummyProvider({ isAsync: isTypeAsync, value: "bar" });
        const optionsProvider1 = new DummyProvider({ isAsync: areOptionsAsync, value: OPTIONS_1 });
        const optionsProviderNotAvailable1 = new DummyProvider({ isAsync: areOptionsAsync, description: "opts 1" });
        const optionsProvider2 = new DummyProvider({ isAsync: areOptionsAsync, value: OPTIONS_2 });
        const optionsProviderNotAvailable2 = new DummyProvider({ isAsync: areOptionsAsync, description: "opts 2" });

        it("not available if type is not available", () => {
            const provider = PickByTypeProvider.create(new DummyProvider({ isAsync: isTypeAsync, description: "type" }))
                .registerOptions(TYPE_1, optionsProvider1)
                .registerOptions(TYPE_2, optionsProvider2);

            return assertNotAvailable(isTypeAsync, provider.getValue(), "type");
        });

        it("fails if resolved type is not available", () => {
            const provider = PickByTypeProvider.create(new DummyProvider({ isAsync: isTypeAsync, value: "baz" }))
                .registerOptions(TYPE_1, optionsProvider1)
                .registerOptions(TYPE_2, optionsProvider2);

            return assertProviderError(
                isTypeAsync,
                provider.getValue(),
                ERRORS.PICK_PROVIDER_UNREGISTERED_TYPE.format("baz", [TYPE_1, TYPE_2].join(", "))
            );
        });

        describe("not available when options are not available", () => {
            it("first options", () => {
                const provider = PickByTypeProvider.create(typeProvider1)
                    .registerOptions(TYPE_1, optionsProviderNotAvailable1)
                    .registerOptions(TYPE_2, optionsProvider2);

                return assertNotAvailable(isTypeAsync || areOptionsAsync, provider.getValue(), "opts 1");
            });

            it("second options", () => {
                const provider = PickByTypeProvider.create(typeProvider2)
                    .registerOptions(TYPE_1, optionsProvider1)
                    .registerOptions(TYPE_2, optionsProviderNotAvailable2);

                return assertNotAvailable(isTypeAsync || areOptionsAsync, provider.getValue(), "opts 2");
            });
        });

        describe("not available when options nested providers are not available", () => {
            it("first options", () => {
                const provider = PickByTypeProvider.create(typeProvider1)
                    .registerOptions(TYPE_1, {
                        some: {
                            deps: optionsProviderNotAvailable1,
                        },
                    })
                    .registerOptions(TYPE_2, optionsProvider2);

                return assertProviderResolvedValidation(
                    isTypeAsync || areOptionsAsync,
                    provider.getValue(),
                    left([new ValueNotAvailable("opts 1")])
                );
            });

            it("second options", () => {
                const provider = PickByTypeProvider.create(typeProvider2)
                    .registerOptions(TYPE_1, optionsProvider1)
                    .registerOptions(TYPE_2, {
                        some: {
                            deps: optionsProviderNotAvailable2,
                        },
                    });

                return assertProviderResolvedValidation(
                    isTypeAsync || areOptionsAsync,
                    provider.getValue(),
                    left([new ValueNotAvailable("opts 2")])
                );
            });
        });

        describe("forwards error", () => {
            const error = new Error("foo");
            it("from type", () => {
                const provider = PickByTypeProvider.create(new DummyProvider({ isAsync: isTypeAsync, error }))
                    .registerOptions(TYPE_1, optionsProvider1)
                    .registerOptions(TYPE_2, optionsProvider2);

                return assertProviderError(isTypeAsync, provider.getValue(), error);
            });

            it("from options", () => {
                const provider = PickByTypeProvider.create(typeProvider1)
                    .registerOptions(TYPE_1, new DummyProvider({ error, isAsync: areOptionsAsync }))
                    .registerOptions(TYPE_2, optionsProvider2);

                return assertProviderError(isTypeAsync || areOptionsAsync, provider.getValue(), error);
            });
        });
    });

    it("types", () => {
        const provider = PickByTypeProvider.create(DummyProvider.sync({ value: "foo" }))
            .registerOptions(TYPE_1, DummyProvider.sync<typeof OPTIONS_1>({ value: OPTIONS_1 }))
            .registerOptions(TYPE_2, DummyProvider.sync<typeof OPTIONS_2>({ value: OPTIONS_2 }))
            .registerOptions("zeta", { test: "zeta" } as const);

        type Providers =
            | PickByTypeProvider.Value<"foo", typeof OPTIONS_1>
            | PickByTypeProvider.Value<"bar", typeof OPTIONS_2>
            | PickByTypeProvider.Value<"zeta", { test: "zeta" }>;

        const value = provider.getValue();

        type ProviderValue = OptionalPromise<Provider.Value<Providers>>;
        assert<IsExact<typeof value, ProviderValue>>(true);
    });
});
