import * as path from 'path';
import {envFileProviderFactory} from '@src/envFileProviderFactory';

describe('envFileProviderFactory', () => {
    it('simple case', () => {
        const factory = envFileProviderFactory({
            paths: './example/base.env',
            cwd: __dirname
        });

        expect(factory('FOO').getValue())
            .toEqual('bar');

        expect(factory('HELLO').getValue())
            .toEqual('world');
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
            .toEqual('world');
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
            .toEqual('BAR');
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

        expect(factory('FOO').isAvailable())
            .toBe(false);
    })
});
