import { TomlProvider } from "@src/TomlProvider";

import { ValueNotAvailable } from "@pallad/config";

describe("TomlProvider", () => {
    // eslint-disable-next-line no-null/no-null
    it.each([[undefined], [null]])("returns ValueNotAvailable for property with value: %s ", value => {
        const provider = new TomlProvider("foo", () => ({ foo: value }));
        const resolvedValue = provider.getValue();

        expect(resolvedValue.isLeft()).toBe(true);
        expect(resolvedValue.value).toEqual(new ValueNotAvailable("TOML config at property path: foo"));
    });

    it("returns value at given path", () => {
        const provider = new TomlProvider("foo.bar", () => ({ foo: { bar: "baz" } }));
        const resolvedValue = provider.getValue();

        expect(resolvedValue.isRight()).toBe(true);
        expect(resolvedValue.value).toBe("baz");
    });

    it("returns Left if config loading fails", () => {
        const error = new Error("error");
        const provider = new TomlProvider("foo.bar", () => {
            throw error;
        });

        const resolvedValue = provider.getValue();
        expect(resolvedValue.isLeft()).toBe(true);
        expect(resolvedValue.value).toBe(error);
    });
});
