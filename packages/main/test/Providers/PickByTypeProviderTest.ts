import {env} from '@src/helpers';
import {assert, IsExact} from 'conditional-type-checks';
import {DummyProvider} from '../dummies/DummyProvider';
import {PickByTypeProvider} from '@src/Providers/PickByTypeProvider';
import {OptionalPromise} from '@src/utils';

describe('PickByTypeDependency', () => {

    const TYPE_1 = 'foo';
    const TYPE_2 = 'bar';

    const OPTIONS_1 = {
        foo: 'bar'
    } as const;

    const OPTIONS_2 = {
        bar: 'baz'
    } as const;

    it('description', () => {
        const provider = PickByTypeProvider.create(
            DummyProvider.sync({value: 'foo', description: 'Type description'})
        )
            .registerOptions('foo', DummyProvider.sync({value: OPTIONS_1}))
            .registerOptions('bar', DummyProvider.sync({value: OPTIONS_2}));

        expect(provider.getDescription())
            .toMatchSnapshot();
    });

    describe('registering', () => {
        it('fails if register type that is already registered', () => {
            expect(() => {
                PickByTypeProvider.create(
                    DummyProvider.sync({value: 'test'})
                )
                    .registerOptions('foo', 'foo')
                    .registerOptions('foo', 'bar');
            })
                .toThrowErrorMatchingSnapshot();
        });
    });

    describe('sync', () => {
        describe('availability', () => {
            describe('not available if', () => {
                it('type provider is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.syncNotAvailable())
                        .registerOptions('foo', DummyProvider.sync({value: OPTIONS_1}))
                        .registerOptions('bar', DummyProvider.sync({value: OPTIONS_2}));

                    expect(provider.isAvailable())
                        .toBe(false);
                });

                it('options provider is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.sync({value: 'foo'}))
                        .registerOptions('foo', DummyProvider.syncNotAvailable())
                        .registerOptions('bar', DummyProvider.syncNotAvailable());

                    expect(provider.isAvailable())
                        .toBe(false);
                });

                it('options has any providers that is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.sync({value: 'foo'}))
                        .registerOptions('foo', {
                            foo: DummyProvider.syncNotAvailable()
                        })
                        .registerOptions('bar', {
                            bar: DummyProvider.syncNotAvailable()
                        });

                    expect(provider.isAvailable())
                        .toBe(false);
                });
            });


            it('is available if type and options are available', () => {
                const provider = PickByTypeProvider.create(DummyProvider.sync({value: 'foo'}))
                    .registerOptions('foo', DummyProvider.sync({value: OPTIONS_1}))
                    .registerOptions('bar', DummyProvider.syncNotAvailable());

                expect(provider.isAvailable())
                    .toBe(true);
            });
        });

        describe('getting value', () => {
            it('fails if type is not available', () => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.syncNotAvailable()
                )
                    .registerOptions(TYPE_1, DummyProvider.sync({value: OPTIONS_1}))
                    .registerOptions(TYPE_2, DummyProvider.sync({value: OPTIONS_2}));

                expect(() => {
                    provider.getValue()
                })
                    .toThrowErrorMatchingSnapshot();
            });

            it('fails if resolved type is not registered', () => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.sync({value: 'test'})
                )
                    .registerOptions(TYPE_1, OPTIONS_1)
                    .registerOptions(TYPE_2, OPTIONS_2)

                expect(() => {
                    provider.getValue()
                })
                    .toThrowErrorMatchingSnapshot();
            });

            it.each<[string, any]>([
                [TYPE_1, OPTIONS_1],
                [TYPE_2, OPTIONS_2]
            ])('selects options for given type', (type, expectedOptions) => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.sync({value: type})
                )
                    .registerOptions(TYPE_1, DummyProvider.sync({value: OPTIONS_1}))
                    .registerOptions(TYPE_2, DummyProvider.sync({value: OPTIONS_2}));

                expect(provider.getValue())
                    .toStrictEqual({
                        type,
                        options: expectedOptions
                    });
            });
        });
    });

    describe('async', () => {
        describe('availability', () => {
            describe('not available if', () => {
                it('type provider is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.asyncNotAvailable())
                        .registerOptions('foo', DummyProvider.async({value: OPTIONS_1}))
                        .registerOptions('bar', DummyProvider.async({value: OPTIONS_2}));

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(false);
                });

                it('options provider is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.async({value: 'foo'}))
                        .registerOptions('foo', DummyProvider.asyncNotAvailable())
                        .registerOptions('bar', DummyProvider.asyncNotAvailable());

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(false);
                });

                it('options has any providers that is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.async({value: 'foo'}))
                        .registerOptions('foo', {
                            foo: DummyProvider.asyncNotAvailable()
                        })
                        .registerOptions('bar', {
                            bar: DummyProvider.asyncNotAvailable()
                        });

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(false);
                });
            });


            it('is available if type and options are available', () => {
                const provider = PickByTypeProvider.create(DummyProvider.async({value: 'foo'}))
                    .registerOptions('foo', DummyProvider.async({value: OPTIONS_1}))
                    .registerOptions('bar', DummyProvider.asyncNotAvailable());

                return expect(provider.isAvailable())
                    .resolves
                    .toBe(true);
            });
        });

        describe('getting value', () => {
            it('fails if type is not available', () => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.asyncNotAvailable()
                )
                    .registerOptions(TYPE_1, DummyProvider.async({value: OPTIONS_1}))
                    .registerOptions(TYPE_2, DummyProvider.async({value: OPTIONS_2}));

                return expect(provider.getValue())
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });

            it('fails if resolved type is not registered', () => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.async({value: 'test'})
                )
                    .registerOptions(TYPE_1, OPTIONS_1)
                    .registerOptions(TYPE_2, OPTIONS_2)

                return expect(provider.getValue())
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });

            it.each<[string, any]>([
                [TYPE_1, OPTIONS_1],
                [TYPE_2, OPTIONS_2]
            ])('selects options for given type', (type, expectedOptions) => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.async({value: type})
                )
                    .registerOptions(TYPE_1, DummyProvider.async({value: OPTIONS_1}))
                    .registerOptions(TYPE_2, DummyProvider.async({value: OPTIONS_2}));

                return expect(provider.getValue())
                    .resolves
                    .toStrictEqual({
                        type,
                        options: expectedOptions
                    });
            });
        });
    });

    describe('async + sync', () => {
        describe('availability', () => {
            describe('not available if', () => {
                it('async options provider is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.sync({value: 'foo'}))
                        .registerOptions('foo', DummyProvider.asyncNotAvailable())
                        .registerOptions('bar', DummyProvider.asyncNotAvailable());

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(false);
                });

                it('sync options provider is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.async({value: 'foo'}))
                        .registerOptions('foo', DummyProvider.syncNotAvailable())
                        .registerOptions('bar', DummyProvider.syncNotAvailable());

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(false);
                });

                it('options has any async providers that is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.sync({value: 'foo'}))
                        .registerOptions('foo', {
                            foo: DummyProvider.asyncNotAvailable()
                        })
                        .registerOptions('bar', {
                            bar: DummyProvider.asyncNotAvailable()
                        });

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(false);
                });

                it('options has any sync providers that is not available', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.async({value: 'foo'}))
                        .registerOptions('foo', {
                            foo: DummyProvider.syncNotAvailable()
                        })
                        .registerOptions('bar', {
                            bar: DummyProvider.syncNotAvailable()
                        });

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(false);
                });
            });

            describe('is available if type and options are available', () => {
                it('async type, sync options', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.async({value: 'foo'}))
                        .registerOptions('foo', DummyProvider.sync({value: OPTIONS_1}))
                        .registerOptions('bar', DummyProvider.syncNotAvailable());

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(true);
                });

                it('sync type, async options', () => {
                    const provider = PickByTypeProvider.create(DummyProvider.sync({value: 'foo'}))
                        .registerOptions('foo', DummyProvider.async({value: OPTIONS_1}))
                        .registerOptions('bar', DummyProvider.syncNotAvailable());

                    return expect(provider.isAvailable())
                        .resolves
                        .toBe(true);
                });
            });
        });

        describe('getting value', () => {
            it('fails if type is not available', () => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.asyncNotAvailable()
                )
                    .registerOptions(TYPE_1, DummyProvider.sync({value: OPTIONS_1}))
                    .registerOptions(TYPE_2, DummyProvider.async({value: OPTIONS_2}));

                return expect(provider.getValue())
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });

            it('fails if resolved type is not registered', () => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.async({value: 'test'})
                )
                    .registerOptions(TYPE_1, OPTIONS_1)
                    .registerOptions(TYPE_2, OPTIONS_2)

                return expect(provider.getValue())
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });

            it.each<[string, any]>([
                [TYPE_1, OPTIONS_1],
                [TYPE_2, OPTIONS_2]
            ])('selects options for given type', (type, expectedOptions) => {
                const provider = PickByTypeProvider.create(
                    DummyProvider.async({value: type})
                )
                    .registerOptions(TYPE_1, DummyProvider.sync({value: OPTIONS_1}))
                    .registerOptions(TYPE_2, DummyProvider.async({value: OPTIONS_2}));

                return expect(provider.getValue())
                    .resolves
                    .toStrictEqual({
                        type,
                        options: expectedOptions
                    });
            });
        });
    });

    it('types', () => {
        const dep = PickByTypeProvider.create(DummyProvider.sync({value: 'foo'}))
            .registerOptions('foo', DummyProvider.sync<typeof OPTIONS_1>({value: OPTIONS_1}))
            .registerOptions('bar', DummyProvider.sync<typeof OPTIONS_2>({value: OPTIONS_2}))
            .registerOptions('zeta', {test: 'zeta'} as const);

        assert<IsExact<ReturnType<typeof dep.getValue>,
            OptionalPromise<PickByTypeProvider.Value<'foo', typeof OPTIONS_1> |
                PickByTypeProvider.Value<'bar', typeof OPTIONS_2> |
                PickByTypeProvider.Value<'zeta', { test: 'zeta' }>>>>(true);
    });
});
