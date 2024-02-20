import { Provider } from "@src/Provider";
import { DummyProvider } from "./dummies/DummyProvider";

describe("Provider", () => {
    const VALUE = { raw: "value" } as const;
    describe("testing is Provider", () => {
        it("from local module", () => {
            expect(
                Provider.isType(
                    new DummyProvider({
                        value: VALUE,
                        isAsync: false,
                    })
                )
            ).toBe(true);

            expect(
                Provider.isType({
                    getValue() {
                        return true;
                    },
                })
            ).toBe(false);
        });
    });
});
