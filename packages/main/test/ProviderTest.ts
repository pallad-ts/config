import {Provider} from "@src/Provider";
import {DummyProvider} from "./dummies/DummyProvider";
import * as fs from 'fs';
import * as path from 'path';
import {right} from "@sweet-monads/either";

describe('Provider', () => {
    const VALUE = {raw: 'value'} as const;
    describe('testing is Provider', () => {

        it('from local module', () => {
            expect(Provider.is(new DummyProvider({
                value: VALUE,
                isAsync: false,
            }))).toBe(true);

            expect(Provider.is({
                getValue() {
                    return true
                }
            })).toBe(false);
        })

        describe('from copy of module', () => {
            const FINAL_PATH = path.join(__dirname, '../src/ProviderCopy.ts');
            const SOURCE_PATH = path.join(__dirname, '../src/Provider.ts');
            beforeEach(() => {
                return fs.promises.copyFile(SOURCE_PATH, FINAL_PATH);
            });

            it('checking instance', () => {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const {Provider: NewProvider} = require(FINAL_PATH);

                const newInstance = new class extends NewProvider {
                    getValue() {
                        return right(true);
                    }
                };
                const dummy = new DummyProvider({
                    value: VALUE,
                    isAsync: false,
                });

                expect(Provider.is(newInstance)).toBe(true);
                expect(NewProvider.is(newInstance)).toBe(true);
                expect(Provider.is(dummy)).toBe(true);
                expect(NewProvider.is(dummy)).toBe(true);

                expect(NewProvider.is(undefined)).toBe(false);
                // eslint-disable-next-line no-null/no-null
                expect(NewProvider.is(null)).toBe(false);
            });

            afterEach(() => {
                return fs.promises.unlink(FINAL_PATH);
            });
        });
    });
});
