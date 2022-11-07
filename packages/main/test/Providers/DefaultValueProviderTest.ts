import {DefaultValueProvider} from "@src/Providers";
import {DummyProvider} from "../dummies/DummyProvider";
import {Provider} from "@src/Provider";
import {assert, IsExact} from 'conditional-type-checks';
import {OptionalPromise} from '@src/utils';
import {assertProviderValue} from '../common/assertProviderValue';
import {assertProviderError} from '../common/assertProviderError';

describe('DefaultValueProvider', () => {
    const DEFAULT_VALUE = {default: 'value'} as const;

    const RAW_VALUE = {raw: 'value'} as const;

    function createProvider<T>(provider: Provider<T>) {
        return new DefaultValueProvider(provider, DEFAULT_VALUE);
    }


    describe('getting value', () => {
        describe.each([
            ['sync'],
            ['async']
        ])('%s', type => {
            const isAsync = type === 'async';
            it('uses default value if provider value not available', () => {
                const provider = createProvider(
                    DummyProvider.notAvailable({isAsync})
                );
                return assertProviderValue(
                    isAsync,
                    provider.getValue(),
                    DEFAULT_VALUE
                );
            });

            it('uses provider value if available', () => {
                const provider = createProvider(
                    new DummyProvider({value: RAW_VALUE, isAsync})
                );

                return assertProviderValue(
                    isAsync,
                    provider.getValue(),
                    RAW_VALUE
                );
            });

            it('forwards provider error', () => {
                const error = new Error('test');
                const provider = createProvider(
                    new DummyProvider({error, isAsync})
                );

                return assertProviderError(
                    isAsync,
                    provider.getValue(),
                    error
                );
            })
        })
    })

    describe('optionalWrap', () => {
        const dep = new DummyProvider({
            value: RAW_VALUE,
            isAsync: false,
        });

        it('returns original provider if default value is undefined', () => {
            const provider = DefaultValueProvider.optionalWrap(dep);
            expect(provider)
                .toStrictEqual(dep);
        });

        it('allows to use undefined', () => {
            const provider = DefaultValueProvider.optionalWrap(dep, undefined);
            expect(provider)
                .toStrictEqual(new DefaultValueProvider(dep, undefined));
        });

        it('wraps provided provider with TransformerProvider', () => {
            const provider = DefaultValueProvider.optionalWrap(dep, DEFAULT_VALUE);
            expect(provider)
                .toStrictEqual(new DefaultValueProvider(dep, DEFAULT_VALUE));
        });
    });

    it('types', () => {
        const provider = new DefaultValueProvider(
            DummyProvider.sync<'foo'>({value: 'foo'}),
            'bar' as const
        );

        const value = provider.getValue();
        assert<IsExact<typeof value, OptionalPromise<Provider.Value<'foo' | 'bar'>>>>(true);
    });
});
