import { DefaultValueProvider, Provider, TransformProvider } from "@src/Provider";
import { right } from "@sweet-monads/either";
import { assert, IsExact } from "conditional-type-checks";

import { secret, Secret } from "@pallad/secret";

import { DummyProvider } from "./dummies/DummyProvider";

describe("Provider", () => {
    const VALUE = { raw: "value" } as const;
    type ValueType = typeof VALUE;

    describe("transform", () => {
        it("wraps value with transform provider", () => {
            const transformedProvider = DummyProvider.sync({ value: VALUE }).transform(value => value.raw.length);

            expect(transformedProvider).toBeInstanceOf(TransformProvider);
            expect(transformedProvider.getValue()).toStrictEqual(right(5));
            assert<IsExact<typeof transformedProvider, TransformProvider<number, ValueType>>>(true);
        });
    });

    describe("defaultTo", () => {
        it("wraps value with default provider", () => {
            const transformedProvider = DummyProvider.syncNotAvailable<ValueType>().defaultTo(10);

            expect(transformedProvider).toBeInstanceOf(DefaultValueProvider);
            expect(transformedProvider.getValue()).toStrictEqual(right(10));
            assert<IsExact<typeof transformedProvider, DefaultValueProvider<number, ValueType>>>(true);
        });
    });

    describe("optional", () => {
        it("wraps value with default provider", () => {
            const transformedProvider = DummyProvider.syncNotAvailable<ValueType>().optional();

            expect(transformedProvider).toBeInstanceOf(DefaultValueProvider);
            expect(transformedProvider.getValue()).toStrictEqual(right(undefined));
            assert<IsExact<typeof transformedProvider, DefaultValueProvider<undefined, ValueType>>>(true);
        });
    });

    describe("secret", () => {
        it("wraps value with secreet", () => {
            const transformedProvider = DummyProvider.sync({ value: VALUE }).secret();

            expect(transformedProvider).toBeInstanceOf(TransformProvider);
            const resolvedValue = transformedProvider.getValue();
            expect(resolvedValue).toStrictEqual(right(secret(VALUE)));
            assert<IsExact<typeof transformedProvider, TransformProvider<Secret<ValueType>, ValueType>>>(true);
        });
    });
});
