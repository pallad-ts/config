import * as sinon from 'sinon';
import {type, ValueNotAvailable} from '@pallad/config';
import {ssmProviderFactory} from '@src/ssmProviderFactory';
import {Validation} from 'monet';

describe('ssmProviderFactory', () => {
    describe('ssm', () => {
        let helper: ReturnType<typeof ssmProviderFactory>;

        const CONFIG = {
            prefix: 'pallad-config-'
        };

        beforeEach(() => {
            helper = ssmProviderFactory({
                ...CONFIG
            });
        });

        describe('loading', () => {
            it('success', () => {
                const provider = helper('var1');

                return expect(provider.getValue())
                    .resolves
                    .toEqual(Validation.Success('bar'))
            });

            it('success with default value', () => {
                const provider = helper('var100', {default: 'bar'});
                return expect(provider.getValue())
                    .resolves
                    .toEqual(Validation.Success('bar'));
            });

            it('failure due to lack of parameter', () => {
                const dependency = helper('var1000');

                return expect(dependency.getValue())
                    .resolves
                    .toStrictEqual(
                        Validation.Fail(new ValueNotAvailable('SSM: pallad-config-var1000'))
                    );
            });

            it('loading with type conversion', () => {
                const dependency = helper('var4', {transformer: type.int});

                return expect(dependency.getValue())
                    .resolves
                    .toEqual(Validation.Success(10));
            });

            it('loading array of strings', () => {
                const dependency = helper('var2');
                return expect(dependency.getValue())
                    .resolves
                    .toEqual(Validation.Success(['foo', 'bar']));
            });

            it('uses custom dataLoader factory', () => {
                const dataLoader = {};
                const stub = sinon.stub()
                    .resolves(dataLoader);

                ssmProviderFactory({
                    ...CONFIG,
                    createDataLoader: stub,
                });

                sinon.assert.calledOnce(stub);
            });

            it('using parameter deserializer', () => {
                const stub = sinon.stub()
                    .resolves(1000);

                const helper = ssmProviderFactory({
                    ...CONFIG,
                    parameterDeserializer: stub,
                });

                const dependency = helper('var1');

                return expect(dependency.getValue())
                    .resolves
                    .toEqual(Validation.Success(1000));
            });

            it('loading many variables', () => {
                const dependencies = [
                    helper('var1'),
                    helper('var2'),
                    helper('var3'),
                    helper('var4'),
                    helper('var5'),
                    helper('var6'),
                    helper('var7'),
                    helper('var8'),
                    helper('var9'),
                    helper('var10'),
                    helper('var11'),
                    helper('var12'),
                ];

                return expect(
                    Promise.all(dependencies.map(x => x.getValue()))
                )
                    .resolves
                    .toEqual([
                        'bar',
                        ['foo', 'bar'],
                        'world',
                        '10',
                        'wjeNdAbmyjtqAU2OcuPR15F4xDzlV1uZHmZNNl1p',
                        "u6yjSXzp9q5yhaCdEWyj",
                        "7FZxN9NHXcgleeP0TSva",
                        "R3aogUWGdvDJy03brMVEZBnqKJYZcp",
                        "XUlAtGjdCwIiHDnojsFqmOC6HO8SyXX",
                        "u97tvnLBUOurP3FcpUWRqbO81GqqH",
                        "HMZNkhmMOxZsylqOaxfNwjeAf9Ju",
                        "DRJeSQn6CmLVuo5eXHGkVABTsgy",
                    ].map(Validation.Success));
            })
        });
    });
});
