import {envFileProviderFactory} from '@src/envFileProviderFactory';
import {DefaultValueProvider, ValueNotAvailable} from '@pallad/config';
import {assert, IsExact} from 'conditional-type-checks';
import {EnvFileProvider} from '@src/EnvFileProvider';
import {int} from '@pallad/config/compiled/types';
import {left, right} from "@sweet-monads/either";

describe('envFileProviderFactory', () => {

    describe('types', () => {
        const factory = envFileProviderFactory({
            paths: './example/base.env',
            cwd: __dirname
        });

        it('no default and transformer', () => {
            const provider = factory('FOO');

            type Input = typeof provider;
            type Expected = EnvFileProvider;
            assert<IsExact<Input, Expected>>(true);
        });

        it('with default and no transformer', () => {
            const provider = factory('FOO', {default: 100});

            type Input = typeof provider;
            type Expected = DefaultValueProvider<number, string>;
            assert<IsExact<Input, Expected>>(true);
        });

        it('with default and transformer', () => {
            const provider = factory('FOO', {default: {foo: 'bar'} as const, transformer: int});

            type Input = typeof provider;
            type Expected = DefaultValueProvider<{ foo: 'bar' }, string | number>;
            assert<IsExact<Input, Expected>>(true);
        });
    });

    it('simple case', () => {
        const factory = envFileProviderFactory({
            paths: './example/base.env',
            cwd: __dirname
        });

        expect(factory('FOO').getValue())
            .toStrictEqual(right('bar'));

        expect(factory('HELLO').getValue())
            .toStrictEqual(right('world'));
    });

    it('overriding env from previous files', () => {
        const factory = envFileProviderFactory({
            paths: [
                './example/base.env',
                './example/override.env'
            ],
            cwd: __dirname
        });

        expect(factory('FOO').getValue())
            .toStrictEqual(right('world'));
    });

    it('using with transformer', () => {
        const factory = envFileProviderFactory({
            paths: './example/base.env',
            cwd: __dirname
        });

        expect(
            factory('FOO', {transformer: value => value.toUpperCase()})
                .getValue()
        )
            .toEqual(right('BAR'));
    });

    it('fails if env file does not exist and ignoring is disabled', () => {
        expect(() => {
            envFileProviderFactory({
                paths: './example/test.env',
                cwd: __dirname
            });
        })
            .toThrowErrorMatchingSnapshot();
    });

    it('silently ignores file if it is not required', () => {
        const factory = envFileProviderFactory({
            paths: {path: './example/test.env', required: false},
            cwd: __dirname
        });

        expect(factory('FOO').getValue())
            .toStrictEqual(
                left(new ValueNotAvailable('"FOO" from ENV file(s)'))
            )
    });

    it('populates process env if set', () => {
        envFileProviderFactory({
            paths: './example/populate.env',
            cwd: __dirname,
            populateToEnv: true
        })

        expect(process.env.PALLAD_CONFIG_TEST_VALUE)
            .toStrictEqual('test');
    });
});
