import {DummyProvider} from './dummies/DummyProvider';
import {Either} from 'monet';
import {ERRORS} from '@src/errors';
import {loadAsync} from '@src/loadAsync';

describe('loadAsync', () => {
    it('loads config', () => {
        const input = {
            foo: DummyProvider.async({value: 'foo'}),
            nested: {
                bar: DummyProvider.async({value: 'bar'})
            }
        };

        const config = loadAsync(input);
        expect(config)
            .resolves
            .toStrictEqual({
                foo: 'foo',
                nested: {
                    bar: 'bar'
                }
            });
    });

    describe('fails', () => {
        it('if some of providers are not available', async () => {
            const result = await Either.fromPromise(loadAsync({
                foo: new DummyProvider({isAsync: true, description: 'foo desc'})
            }));
            expect(result.left())
                .toHaveProperty('code', ERRORS.CONFIG_LOADING_FAILED.code);

            expect(result.left())
                .toHaveProperty('errors', [
                    ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format('foo desc')
                ]);
        });

        it('if some of providers fail', async () => {
            const error = new Error('test');
            const result = await Either.fromPromise(loadAsync({
                foo: new DummyProvider({isAsync: true, error})
            }));
            expect(result.left())
                .toHaveProperty('code', ERRORS.CONFIG_LOADING_FAILED.code);

            expect(result.left())
                .toHaveProperty('errors', [
                    error
                ]);
        });

        it('if some of providers fails with multiple errors', async () => {
            const error1 = new Error('test');
            const error2 = new Error('e2');
            const error3 = new Error('e3');
            const error4 = new Error('e4');

            const result = await Either.fromPromise(loadAsync({
                foo: new DummyProvider({isAsync: true, error: [error1, error2]}),
                var: new DummyProvider({isAsync: true, error: [error3, error4]})
            }));

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