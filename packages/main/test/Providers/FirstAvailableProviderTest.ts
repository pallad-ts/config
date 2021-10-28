import {assert, IsExact} from 'conditional-type-checks';
import {FirstAvailableProvider} from '@src/Providers';
import {DummyProvider} from '../dummies/DummyProvider';
import {OptionalPromise} from '@src/utils';

describe('FirstAvailableProvider', () => {

    it('types', () => {
        const provider = new FirstAvailableProvider(
            DummyProvider.sync<'foo'>({value: 'foo', isAvailable: true}),
            DummyProvider.sync<'bar'>({value: 'bar', isAvailable: true}),
        );
        const value = provider.getValue();
        assert<IsExact<typeof value, OptionalPromise<'foo' | 'bar'>>>(true);
    });

    it('description', () => {
        const provider = new FirstAvailableProvider(
            DummyProvider.sync({value: 'foo', isAvailable: true, description: 'desc1'}),
            DummyProvider.sync({value: 'foo2', isAvailable: true, description: 'desc2'}),
            DummyProvider.sync({value: 'foo3', isAvailable: true, description: 'desc3'}),
        );

        expect(provider.getDescription())
            .toMatchSnapshot();
    });

    describe('sync', () => {
        describe('getting value', () => {
            it('first one is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.sync({value: 'foo', isAvailable: true}),
                    DummyProvider.sync({value: 'bar', isAvailable: true}),
                );
                expect(provider.getValue())
                    .toEqual('foo');
            });

            it('second one is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.sync({value: 'foo', isAvailable: false}),
                    DummyProvider.sync({value: 'bar', isAvailable: true}),
                );
                expect(provider.getValue())
                    .toEqual('bar');
            });

            it('throw an error if none is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.sync({value: 'foo', isAvailable: false}),
                    DummyProvider.sync({value: 'bar', isAvailable: false}),
                );

                expect(() => {
                    provider.getValue()
                })
                    .toThrowErrorMatchingSnapshot();
            });
        });

        describe('availability', () => {
            it('available if any of providers is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.sync({value: 'foo', isAvailable: false}),
                    DummyProvider.sync({value: 'bar', isAvailable: false}),
                    DummyProvider.sync({value: 'baz', isAvailable: true}),
                );

                expect(provider.isAvailable())
                    .toBe(true);
            });

            it('not available if none of providers is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.sync({value: 'foo', isAvailable: false}),
                    DummyProvider.sync({value: 'bar', isAvailable: false}),
                    DummyProvider.sync({value: 'baz', isAvailable: false}),
                );

                expect(provider.isAvailable())
                    .toBe(false);
            });
        });
    });

    describe('async', () => {
        describe('getting value', () => {
            it('first one is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.async({value: 'foo', isAvailable: true}),
                    DummyProvider.async({value: 'bar', isAvailable: true}),
                );
                return expect(provider.getValue())
                    .resolves
                    .toEqual('foo');
            });

            it('second one is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.async({value: 'foo', isAvailable: false}),
                    DummyProvider.async({value: 'bar', isAvailable: true}),
                );
                return expect(provider.getValue())
                    .resolves
                    .toEqual('bar');
            });

            it('throw an error if none is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.async({value: 'foo', isAvailable: false}),
                    DummyProvider.async({value: 'bar', isAvailable: false}),
                );

                return expect(provider.getValue())
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });

        describe('availability', () => {
            it('available if any of providers is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.async({value: 'foo', isAvailable: false}),
                    DummyProvider.async({value: 'bar', isAvailable: false}),
                    DummyProvider.async({value: 'baz', isAvailable: true}),
                );

                return expect(provider.isAvailable())
                    .resolves
                    .toBe(true);
            });

            it('not available if none of providers is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.async({value: 'foo', isAvailable: false}),
                    DummyProvider.async({value: 'bar', isAvailable: false}),
                    DummyProvider.async({value: 'baz', isAvailable: false}),
                );

                return expect(provider.isAvailable())
                    .resolves
                    .toBe(false);
            });
        });
    });

    describe('sync + async', () => {
        describe('getting value', () => {
            it('first one is available', () => {
                const provider = new FirstAvailableProvider(
                    DummyProvider.sync({value: 'foo', isAvailable: false}),
                    DummyProvider.async({value: 'bar', isAvailable: false}),
                    DummyProvider.async({value: 'bar2', isAvailable: false}),
                    DummyProvider.async({value: 'baz', isAvailable: true}),
                );
                return expect(provider.getValue())
                    .resolves
                    .toEqual('baz');
            });
        });
    });
});
