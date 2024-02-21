import { EnvFileProvider } from "@src/EnvFileProvider";
import { ValueNotAvailable } from "@pallad/config";
import { left, right } from "@sweet-monads/either";

describe("EnvFileProvider", () => {
    describe("not available", () => {
        it("if ENV does not exist", () => {
            const provider = new EnvFileProvider("FOO", {});

            expect(provider.getValue()).toStrictEqual(left(new ValueNotAvailable('"FOO" from ENV file(s)')));
        });

        it("if ENV exists but is empty", () => {
            const provider = new EnvFileProvider("FOO", { FOO: "" });

            expect(provider.getValue()).toStrictEqual(left(new ValueNotAvailable('"FOO" from ENV file(s)')));
        });
    });

    it("success", () => {
        expect(new EnvFileProvider("FOO", { FOO: "bar" }).getValue()).toStrictEqual(right("bar"));
    });
});
