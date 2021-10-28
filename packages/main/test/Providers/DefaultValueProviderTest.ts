import {DefaultValueProvider} from "@src/Providers";
import {DummyProvider} from "../dummies/DummyProvider";
import {Provider} from "@src/Provider";
import {assert, IsExact} from 'conditional-type-checks';
import {OptionalPromise} from '@src/utils';

describe('DefaultValueProvider', () => {
    const DEFAULT_VALUE = {default: 'value'} as const;

    const RAW_VALUE = {raw: 'value'} as const;

    function createProvider(provider: Provider<any>) {
        return new DefaultValueProvider(provider, DEFAULT_VALUE);
    }

    describe('getting value', () => {
        describe('from sync provider', () => {
            describe('where value is available', () => {
                const dep = createProvider(
                    new DummyProvider({isAvailable: true, value: RAW_VALUE, isAsync: false})
                );
                const value = dep.getValue();
                it('then returns provided provider value', () => {
                    expect(value)
                        .toStrictEqual(RAW_VALUE);
                });
            });

            describe('where value is not available', () => {
                const dep = createProvider(
                    new DummyProvider({isAvailable: false, value: RAW_VALUE, isAsync: false})
                );
                const value = dep.getValue();

                it('then returns default value', () => {
                    expect(value)
                        .toStrictEqual(DEFAULT_VALUE);
                });
            });
        });

        describe('from async provider', () => {
            describe('where value is available', () => {
                const dep = createProvider(
                    new DummyProvider({isAvailable: true, value: RAW_VALUE, isAsync: true})
                );
                const value = dep.getValue();
                it('then returns provided provider value', () => {
                    return expect(value)
                        .resolves
                        .toStrictEqual(RAW_VALUE);
                });
            });

            describe('where value is not available', () => {
                const dep = createProvider(
                    new DummyProvider({isAvailable: false, value: RAW_VALUE, isAsync: true})
                );
                const value = dep.getValue();

                it('then returns default value', () => {
                    return expect(value)
                        .resolves
                        .toStrictEqual(DEFAULT_VALUE);
                });
            });
        });
    });

    describe('checking availability', () => {
        describe('is always available', () => {
            it('for sync providers', () => {
                expect(
                    createProvider(
                        new DummyProvider({value: RAW_VALUE, isAsync: false, isAvailable: true}),
                    ).isAvailable()
                )
                    .toBe(true);

                expect(
                    createProvider(
                        new DummyProvider({value: RAW_VALUE, isAsync: false, isAvailable: false}),
                    ).isAvailable()
                )
                    .toBe(true);
            });

            it('for async providers', () => {
                expect(
                    createProvider(
                        new DummyProvider({value: RAW_VALUE, isAsync: true, isAvailable: true}),
                    ).isAvailable()
                )
                    .toBe(true);

                expect(
                    createProvider(
                        new DummyProvider({value: RAW_VALUE, isAsync: true, isAvailable: false}),
                    ).isAvailable()
                )
                    .toBe(true);
            });
        });
    });

    it('description', () => {
        expect(
            createProvider(
                new DummyProvider({value: RAW_VALUE, isAsync: false, isAvailable: true, description: 'Test'})
            )
                .getDescription()
        )
            .toMatchSnapshot();

        expect(
            createProvider(
                new DummyProvider({value: RAW_VALUE, isAsync: false, isAvailable: true, description: 'Random description'})
            )
                .getDescription()
        )
            .toMatchSnapshot();
    })

    describe('optionalWrap', () => {
        const dep = new DummyProvider({
            value: RAW_VALUE,
            isAsync: false,
            isAvailable: true
        });

        it('returns original provider if default value is undefined', () => {
            const provider = DefaultValueProvider.optionalWrap(dep, undefined);
            expect(provider)
                .toStrictEqual(dep);
        });

        it('wraps provided provider with TransformerProvider', () => {
            const provider = DefaultValueProvider.optionalWrap(dep, DEFAULT_VALUE);
            expect(provider)
                .toStrictEqual(new DefaultValueProvider(dep, DEFAULT_VALUE));
        });
    });

    it('types', () => {
        const provider = new DefaultValueProvider(
            DummyProvider.sync<'foo'>({value: 'foo', isAvailable: true}),
            'bar' as const
        );

        const value = provider.getValue();
        assert<IsExact<typeof value, OptionalPromise<'foo' | 'bar'>>>(true);
    });
});
