import { assert, IsExact } from "conditional-type-checks";
import { ResolvedConfig } from "@src/ResolvedConfig";
import { DummyProvider } from "./dummies/DummyProvider";
import { Secret, secret } from "@pallad/secret";
import { env } from "@src/helpers";

describe("ResolvedConfig", () => {
    it("primitives", () => {
        const config = {
            string: "foo",
            num: 1,
            bool: true,
        };

        type Input = typeof config;
        type Output = ResolvedConfig<Input>;
        assert<IsExact<Input, Output>>(true);
    });

    it("providers", () => {
        const config = {
            string: DummyProvider.sync<string>({ value: "foo" }),
            num: DummyProvider.sync<number>({ value: 1 }),
            bool: DummyProvider.sync<boolean>({ value: true }),
        };

        interface Input {
            string: string;
            num: number;
            bool: boolean;
        }

        type Output = ResolvedConfig<typeof config>;
        assert<IsExact<Input, Output>>(true);
    });

    it("plain objects", () => {
        const config = {
            nested: {
                object: {
                    val: DummyProvider.sync<string>({ value: "dupa" }),
                },
                value: 100,
            },
        };

        interface Input {
            nested: {
                object: {
                    val: string;
                };
                value: number;
            };
        }

        type Output = ResolvedConfig<typeof config>;
        assert<IsExact<Input, Output>>(true);
    });

    it("arrays", () => {
        const config = {
            array: [DummyProvider.sync<string>({ value: "foo" }), DummyProvider.async<number>({ value: 100 })],
        };

        interface Input {
            array: Array<string | number>;
        }

        type Output = ResolvedConfig<typeof config>;
        assert<IsExact<Input, Output>>(true);
    });

    it("secrets", () => {
        const config = {
            secret: env("FOO").transform(secret),
        };

        interface Input {
            secret: Secret<string>;
        }

        type Output = ResolvedConfig<typeof config>;
        assert<IsExact<Input, Output>>(true);
    });
});
