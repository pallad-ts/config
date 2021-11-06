import {loadSync} from '@src/loadSync';
import {DummyProvider} from './dummies/DummyProvider';
import {ERRORS} from '@src/errors';
import {Either} from 'monet';

describe('loadSync', () => {
    it('loads config', () => {
        const input = {
            foo: DummyProvider.sync({value: 'foo'}),
            nested: {
                bar: DummyProvider.sync({value: 'bar'})
            }
        };

        const config = loadSync(input);
        expect(config)
            .toStrictEqual({
                foo: 'foo',
                nested: {
                    bar: 'bar'
                }
            });
    });

    describe('fails', () => {
        it('if contains async provider', () => {
            expect(() => {
                loadSync({
                    foo: DummyProvider.async({value: 'foo'})
                })
            })
                .toThrowErrorMatchingSnapshot();
        });

        it('if some of providers is not available', () => {
            const result = Either.fromTry(() => {
                loadSync({
                    foo: DummyProvider.notAvailable({isAsync: false, description: 'foo desc'})
                })
            });
            expect(result.left())
                .toHaveProperty('code', ERRORS.CONFIG_LOADING_FAILED.code);

            expect(result.left())
                .toHaveProperty('errors', [
                    ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format('foo desc')
                ]);
        });

        it('if some of providers fails', () => {
            const error = new Error('foo');
            const result = Either.fromTry(() => {
                loadSync({
                    foo: DummyProvider.notAvailable({isAsync: false, error})
                })
            });
            expect(result.left())
                .toHaveProperty('code', ERRORS.CONFIG_LOADING_FAILED.code);

            expect(result.left())
                .toHaveProperty('errors', [
                    error
                ]);
        });

        it('if some of providers fails with multiple errors', () => {
            const error1 = new Error('test');
            const error2 = new Error('e2');
            const error3 = new Error('e3');
            const error4 = new Error('e4');

            const result = Either.fromTry(() => {
                loadSync({
                    foo: new DummyProvider({isAsync: false, error: [error1, error2]}),
                    var: new DummyProvider({isAsync: false, error: [error3, error4]})
                })
            });

            expect(result.left())
                .toHaveProperty('code', ERRORS.CONFIG_LOADING_FAILED.code);

            expect(result.left())
                .toHaveProperty('errors', [
                    error1,
                    error2,
                    error3,
                    error4
                ]);
        });
    });
});
