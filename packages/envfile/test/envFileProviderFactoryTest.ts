import {envFileProviderFactory} from '@src/envFileProviderFactory';
import {Validation} from 'monet';
import {ValueNotAvailable} from '@pallad/config';

describe('envFileProviderFactory', () => {
    it('simple case', () => {
        const factory = envFileProviderFactory({
            paths: './example/base.env',
            cwd: __dirname
        });

        expect(factory('FOO').getValue())
            .toStrictEqual(Validation.Success('bar'));

        expect(factory('HELLO').getValue())
            .toStrictEqual(Validation.Success('world'));
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
            .toStrictEqual(Validation.Success('world'));
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
            .toStrictEqual(Validation.Success('BAR'));
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
                Validation.Fail(new ValueNotAvailable('"FOO" from ENV file(s)'))
            )
    });

    it('populates process env if set', () => {
        const factory = envFileProviderFactory({
            paths: './example/populate.env',
            cwd: __dirname,
            populateToEnv: true
        })

        expect(process.env.PALLAD_CONFIG_TEST_VALUE)
            .toStrictEqual('test');
    });
});
