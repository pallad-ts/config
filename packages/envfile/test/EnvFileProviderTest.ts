import { EnvFileProvider } from "@src/EnvFileProvider";
import { left, right } from "@sweet-monads/either";

import { ValueNotAvailable } from "@pallad/config";

describe("EnvFileProvider", () => {
    describe("not available", () => {
        it("if ENV does not exist", () => {
            const provider = new EnvFileProvider("FOO", () => ({}));

            expect(provider.getValue()).toStrictEqual(left(new ValueNotAvailable('"FOO" from ENV file(s)')));
        });

        it("if ENV exists but is empty", () => {
            const provider = new EnvFileProvider("FOO", () => ({ FOO: "" }));

            expect(provider.getValue()).toStrictEqual(left(new ValueNotAvailable('"FOO" from ENV file(s)')));
        });
    });

    it("fails if loading env file fails", () => {
        const error = new Error("test");

        const provider = new EnvFileProvider("FOO", () => {
            throw error;
        });

        const value = provider.getValue();
        expect(value.isLeft()).toBe(true);
        expect(value.value).toBe(error);
    });

    it("success", () => {
        expect(new EnvFileProvider("FOO", () => ({ FOO: "bar" })).getValue()).toStrictEqual(right("bar"));
    });
});
