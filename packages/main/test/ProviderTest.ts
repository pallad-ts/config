import {Provider} from "@src/Provider";
import {ERRORS} from "@src/errors";
import {DummyProvider} from "./dummies/DummyProvider";

describe('Provider', () => {
    const VALUE = {foo: 'bar'} as const;
    describe('sync', () => {
        describe('if value is available', () => {
            const dep = new DummyProvider({
                isAvailable: true,
                value: VALUE,
                isAsync: false
            });

            const value = dep.getValue();
            it('returns value in synchronous way', () => {
                expect(value)
                    .toStrictEqual(VALUE);
            });
        });

        describe('is value is not available', () => {
            const dep = new DummyProvider({
                isAvailable: false,
                isAsync: false,
                value: VALUE,
            });
            it('throws an error', () => {
                const error = ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(dep.getDescription());
                expect(() => {
                    dep.getValue();
                })
                    .toThrow(error.message);
            });
        });
    });

    describe('async', () => {
        describe('if value is available', () => {
            const dep = new DummyProvider({
                isAvailable: true,
                value: VALUE,
                isAsync: true,
            });

            const value = dep.getValue();
            it('returns value in synchronous way', async () => {
                return expect(value)
                    .resolves
                    .toStrictEqual(VALUE);
            });
        });

        describe('is value is not available', () => {
            const dep = new DummyProvider({
                isAvailable: false,
                value: VALUE,
                isAsync: true,
            });
            it('throws an error', () => {
                const error = ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(dep.getDescription());
                expect(dep.getValue())
                    .rejects
                    .toThrow(error.message);
            });
        });
    });

    it('testing is Dependency', () => {
        expect(Provider.is(new DummyProvider({
            isAvailable: true,
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