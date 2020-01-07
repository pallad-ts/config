import {EnvFileLoader} from "@src/EnvFileLoader";
import * as path from 'path';

describe('EnvFileLoader', () => {
    describe('loading', () => {
        it('simple case', () => {
            const loader = new EnvFileLoader([
                path.join(__dirname, './example/base.env')
            ]);

            return expect(loader.load())
                .resolves
                .toEqual({
                    FOO: 'bar',
                    HELLO: 'world'
                });
        });

        it('overriding env from previous files', () => {
            const loader = new EnvFileLoader([
                path.join(__dirname, './example/base.env'),
                path.join(__dirname, './example/override.env'),
            ]);

            return expect(loader.load())
                .resolves
                .toEqual({
                    FOO: 'world',
                    HELLO: 'world'
                });
        });

        it('fails if env file does not exist and ignoring is disabled', () => {
            const loader = new EnvFileLoader([
                path.join(__dirname, './example/test.env')
            ], {
                ignoreNonExisting: false
            });

            return expect(loader.load())
                .rejects
                .toThrowError(/no such file or directory/);
        });

        it('loads env even if file does not exist', () => {
            const loader = new EnvFileLoader([
                path.join(__dirname, './example/base.env'),
                path.join(__dirname, './example/test.env')
            ], {
                ignoreNonExisting: true
            });

            return expect(loader.load())
                .resolves
                .toEqual({
                    FOO: 'bar',
                    HELLO: 'world'
                });
        });
    });
});