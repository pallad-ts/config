import {Provider} from "@src/Provider";
import {DummyProvider} from "./dummies/DummyProvider";

describe('Provider', () => {
    const VALUE = {raw: 'value'} as const;
    it('testing is Provider', () => {
        expect(Provider.is(new DummyProvider({
            value: VALUE,
            isAsync: false,
        }))).toBe(true);

        expect(Provider.is({
            getValue() {
                return true
            }
        })).toBe(false);
    });
});
