import {FormattedStringProvider} from '@src/Providers';
import {DummyProvider} from '../dummies/DummyProvider';

describe('FormattedStringProvider', () => {
    const PROV_SYNC_AVAILABLE = new DummyProvider({value: 'foo', isAvailable: true, isAsync: false});
    const PROV_SYNC_NOT_AVAILABLE = new DummyProvider({value: 'foo', isAvailable: false, isAsync: false});
    const PROV_ASYNC_AVAILABLE = new DummyProvider({value: 'bar', isAvailable: true, isAsync: true});
    const PROV_ASYNC_NOT_AVAILABLE = new DummyProvider({value: 'bar', isAvailable: false, isAsync: true});

    function assertProvider(value: any): asserts value is FormattedStringProvider {
        if (!(value instanceof FormattedStringProvider)) {
            throw new Error('Not FormattedStringProvider');
        }
    }

    describe('creating', () => {
        it('without providers', () => {
            expect(FormattedStringProvider.create`Hello ${'world'}`)
                .toEqual('Hello world');
        });
    });

    describe('with sync providers', () => {
        it('creating', () => {
            const result = FormattedStringProvider.create`Hello ${PROV_SYNC_AVAILABLE}`;
            expect(result)
                .toBeInstanceOf(FormattedStringProvider);
        });

        describe('availability', () => {
            it('available if all dependent providers are available', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_SYNC_AVAILABLE}`;
                assertProvider(provider);
                expect(provider.isAvailable())
                    .toBe(true);
            });

            it('not available if at least once dependent provider is not available', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_SYNC_AVAILABLE} and ${PROV_SYNC_NOT_AVAILABLE}`;
                assertProvider(provider);
                expect(provider.isAvailable())
                    .toBe(false);
            });
        });

        describe('getting value', () => {
            it('throws an error if one of dependent providers is not available', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_SYNC_NOT_AVAILABLE}`;
                assertProvider(provider);
                expect(() => {
                    provider.getValue()
                })
                    .toThrowErrorMatchingSnapshot();
            });

            it('returns formatted string', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_SYNC_AVAILABLE}`;
                assertProvider(provider);
                expect(provider.getValue())
                    .toEqual('Hello foo');
            });

            it('simple values are ignored in resolution', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_SYNC_AVAILABLE} and ${'world'}`;
                assertProvider(provider);
                expect(provider.getValue())
                    .toEqual('Hello foo and world');
            })
        });
    });

    describe('with async providers', () => {
        it('creating', () => {
            const result = FormattedStringProvider.create`Hello ${PROV_ASYNC_AVAILABLE}`;
            expect(result)
                .toBeInstanceOf(FormattedStringProvider);
        });

        describe('availability', () => {
            it('available if all dependent providers are available', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_ASYNC_AVAILABLE}`;
                assertProvider(provider);
                return expect(provider.isAvailable())
                    .resolves
                    .toBe(true);
            });

            it('not available if at least once dependent provider is not available', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_ASYNC_AVAILABLE} and ${PROV_ASYNC_NOT_AVAILABLE}`;
                assertProvider(provider);
                return expect(provider.isAvailable())
                    .resolves
                    .toBe(false);
            });
        });

        describe('getting value', () => {
            it('throws an error if one of dependent providers is not available', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_ASYNC_NOT_AVAILABLE}`;
                assertProvider(provider);
                return expect(provider.getValue())
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });

            it('returns formatted string', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_ASYNC_AVAILABLE}`;
                assertProvider(provider);
                return expect(provider.getValue())
                    .resolves
                    .toEqual('Hello bar');
            });

            it('simple values are ignored in resolution', () => {
                const provider = FormattedStringProvider.create`Hello ${PROV_ASYNC_AVAILABLE} and ${'world'}`;
                assertProvider(provider);
                return expect(provider.getValue())
                    .resolves
                    .toEqual('Hello bar and world');
            })
        });
    });

    describe('getting description', () => {
        it('with dependencies', () => {
            const result = FormattedStringProvider.create`Hello ${PROV_SYNC_AVAILABLE} and ${PROV_ASYNC_AVAILABLE}` as any;
            expect(result.getDescription())
                .toMatchSnapshot();
        });

        it('with dependencies and simple values', () => {
            const result = FormattedStringProvider.create`Hello ${'world'} and ${PROV_SYNC_AVAILABLE}` as any;

            expect(result.getDescription())
                .toMatchSnapshot();
        });
    });
});
