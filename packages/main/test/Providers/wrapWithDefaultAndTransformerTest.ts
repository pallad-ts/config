import {DummyProvider} from '../dummies/DummyProvider';
import {assert, IsExact} from 'conditional-type-checks';
import {wrapWithDefaultAndTransformer} from '@src/Providers';
import {OptionalPromise} from '@src/utils';

describe('wrapWithDefaultAndTransformer', () => {
    describe('types', () => {
        type Test = { test: 'type' };
        type Default = { default: 'type' };
        type Transformed = { transformed: 'type' };

        const transformer = (value: any) => {
            return {transformed: 'type'} as Transformed;
        };

        const defaultValue: Default = {default: 'type'};
        const baseProvider = DummyProvider.sync<Test>({value: {test: 'type'}});

        it('with no default value and transformer', () => {
            const provider = wrapWithDefaultAndTransformer(baseProvider);
            const value = provider.getValue();
            assert<IsExact<typeof value, OptionalPromise<Test>>>(true);
        });

        it('with default but no transformer', () => {
            const provider = wrapWithDefaultAndTransformer(baseProvider, {
                default: defaultValue
            });
            const value = provider.getValue();

            assert<IsExact<typeof value, OptionalPromise<Test | Default>>>(true);
        });

        it('with default and transformer', () => {
            const provider = wrapWithDefaultAndTransformer(baseProvider, {
                default: defaultValue,
                transformer
            });
            const value = provider.getValue();

            assert<IsExact<typeof value, OptionalPromise<Test | Default | Transformed>>>(true);
        });

        it('with transformer and no default value', () => {
            const provider = wrapWithDefaultAndTransformer(baseProvider, {
                transformer
            });
            const value = provider.getValue();
            assert<IsExact<typeof value, OptionalPromise<Transformed>>>(true);
        });
    });
})
