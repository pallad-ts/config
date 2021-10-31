/* eslint-disable no-null/no-null */
import {loadConfig} from "@src/common/loadConfig";
import {DummyProvider} from "../dummies/DummyProvider";
import {Validation} from 'monet';
import {ValueNotAvailable} from '@src/ValueNotAvailable';

describe('loadConfig', () => {
    it('simple object without providers', () => {
        const config = {
            foo: 'foo',
            num: 1,
            bool: false,
            bool2: true,
            values: [1, 2, 3, 4],
            obj: {
                bar: 'bar',
                baz: {
                    the: 'baz'
                }
            }
        };
        const result = loadConfig(config);
        expect(result)
            .toEqual(Validation.Success(config));
    });

    it('supports only plain objects, arrays and primitives', () => {
        const config = {
            foo: DummyProvider.sync({value: 'test'}),
            map: new class {
                readonly provider = new DummyProvider({isAsync: true, value: 'this is ignored'})
            }
        };

        const result = loadConfig(config);
        expect(result)
            .toEqual(
                Validation.Success({
                    ...config,
                    foo: 'test'
                })
            );
    })

    it('forwards provider value with multiple errors', () => {
        const error1 = new Error('foo');
        const error2 = new Error('bar');

        const config = {
            foo: DummyProvider.sync({error: [error1, error2]})
        };

        const result = loadConfig(config);
        expect(result)
            .toEqual(
                Validation.Fail([error1, error2])
            );
    });

    describe('with providers', () => {
        describe.each([
            ['sync', 'sync', 'sync'],
            ['sync', 'sync', 'async'],
            ['sync', 'async', 'sync'],
            ['sync', 'async', 'async'],
            ['async', 'sync', 'sync'],
            ['async', 'sync', 'async'],
            ['async', 'async', 'sync'],
            ['async', 'async', 'async'],
        ])('%s + %s + %s', (firstType, secondType, thirdType) => {
            const isFirstAsync = firstType === 'async';
            const isSecondAsync = secondType === 'async';
            const isThirdAsync = thirdType === 'async';

            const isAsync = isFirstAsync || isSecondAsync || isThirdAsync;

            const VALUE_1 = 'value_1' as const;
            const VALUE_2 = 'value_2' as const;
            const VALUE_3 = 'value_3' as const;

            const firstProvider = new DummyProvider({isAsync: isFirstAsync, value: VALUE_1})
            const secondProvider = new DummyProvider({isAsync: isSecondAsync, value: VALUE_2});
            const thirdProvider = new DummyProvider({isAsync: isThirdAsync, value: VALUE_3});

            it('all available', () => {
                const config = {
                    foo: firstProvider,
                    tab: [
                        secondProvider,
                        10,
                    ],
                    object: {
                        nested: {
                            baz: thirdProvider,
                        },
                        repeated: {
                            again: thirdProvider
                        }
                    }
                };

                const result = loadConfig(config);
                (isAsync ? expect(result).resolves : expect(result))
                    .toStrictEqual(
                        Validation.Success({
                            foo: VALUE_1,
                            tab: [
                                VALUE_2,
                                10,
                            ],
                            object: {
                                nested: {
                                    baz: VALUE_3
                                },
                                repeated: {
                                    again: VALUE_3
                                }
                            }
                        })
                    );
            });

            describe('fails if any of providers fails', () => {
                const error = new Error('foo');

                it('first fail as error', () => {
                    const result = loadConfig({
                        foo: new DummyProvider({isAsync: isFirstAsync, error}),
                        bar: secondProvider,
                        baz: thirdProvider
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([error])
                        );
                });

                it('second fail as error', () => {
                    const result = loadConfig({
                        foo: firstProvider,
                        bar: new DummyProvider({isAsync: isSecondAsync, error}),
                        baz: thirdProvider
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([error])
                        );
                });

                it('third fail as error', () => {
                    const result = loadConfig({
                        foo: firstProvider,
                        bar: secondProvider,
                        baz: new DummyProvider({isAsync: isThirdAsync, error})
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([error])
                        );
                });

                it('all fail as error', () => {
                    const result = loadConfig({
                        foo: new DummyProvider({isAsync: isFirstAsync, error}),
                        bar: new DummyProvider({isAsync: isSecondAsync, error}),
                        baz: new DummyProvider({isAsync: isThirdAsync, error})
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([error, error, error])
                        );
                });

                it('first fail as not available', () => {
                    const result = loadConfig({
                        foo: new DummyProvider({isAsync: isFirstAsync, description: 'prov 1'}),
                        bar: secondProvider,
                        baz: thirdProvider
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([
                                new ValueNotAvailable('prov 1')
                            ])
                        );
                });

                it('second fail as not available', () => {
                    const result = loadConfig({
                        foo: firstProvider,
                        bar: new DummyProvider({isAsync: isSecondAsync, description: 'prov 2'}),
                        baz: thirdProvider
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([
                                new ValueNotAvailable('prov 2')
                            ])
                        );
                });

                it('third fail as not available', () => {
                    const result = loadConfig({
                        foo: firstProvider,
                        bar: secondProvider,
                        baz: new DummyProvider({isAsync: isThirdAsync, description: 'prov 3'})
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([
                                new ValueNotAvailable('prov 3')
                            ])
                        );
                });

                it('all fail as not available', () => {
                    const result = loadConfig({
                        foo: new DummyProvider({isAsync: isFirstAsync, description: 'prov 1'}),
                        bar: new DummyProvider({isAsync: isSecondAsync, description: 'prov 2'}),
                        baz: new DummyProvider({isAsync: isThirdAsync, description: 'prov 3'})
                    });
                    (isAsync ? expect(result).resolves : expect(result))
                        .toStrictEqual(
                            Validation.Fail([
                                new ValueNotAvailable('prov 1'),
                                new ValueNotAvailable('prov 2'),
                                new ValueNotAvailable('prov 3'),
                            ])
                        );
                });
            });
        })
    });
});
