import {envProviderFactory} from '@src/providersFactory/envProviderFactory';
import {assert, IsExact} from 'conditional-type-checks';
import {DefaultValueProvider, EnvProvider} from '@src/Providers';
import {int} from '@src/types';

describe('envProviderFactoryTest', () => {
    describe('types', () => {
        const defaultValue = {foo: 'bar'} as const;
        const factory = envProviderFactory();
        it('no default and transformer', () => {
            const provider = factory('FOO');

            type Input = typeof provider;
            type Expected = EnvProvider;
            assert<IsExact<Input, Expected>>(true);
        });

        it('default and no transformer', () => {
            const provider = factory('FOO', {default: defaultValue});

            type Input = typeof provider;
            type Expected = DefaultValueProvider<typeof defaultValue, string>;
            assert<IsExact<Input, Expected>>(true);
        });

        it('undefined default and no transformer', () => {
            const provider = factory('FOO', {default: undefined});

            type Input = typeof provider;
            type Expected = DefaultValueProvider<undefined, string>;
            assert<IsExact<Input, Expected>>(true);
        });

        it('undefined default and transformer', () => {
            const provider = factory('FOO', {default: undefined, transformer: int});

            type Input = typeof provider;
            type Expected = DefaultValueProvider<undefined, string | number>;
            assert<IsExact<Input, Expected>>(true);
        });

        it('default and transformer', () => {
            const provider = factory('FOO', {default: defaultValue, transformer: int});

            type Input = typeof provider;
            type Expected = DefaultValueProvider<typeof defaultValue, string | number>;
            assert<IsExact<Input, Expected>>(true);
        });
    });
});
