import * as sinon from 'sinon';
import {type, ValueNotAvailable} from '@pallad/config';
import {ssmProviderFactory} from '@src/ssmProviderFactory';
import {left, right} from "@sweet-monads/either";
import {DataLoader} from "@src/index";

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
                    .toEqual(right('bar'))
            });

            it('success with default value', () => {
                const provider = helper('var100', {default: 'bar'});
                return expect(provider.getValue())
                    .resolves
                    .toEqual(right('bar'));
            });

            it('failure due to lack of parameter', () => {
                const dependency = helper('var1000');

                return expect(dependency.getValue())
                    .resolves
                    .toStrictEqual(
                        left(new ValueNotAvailable('SSM: pallad-config-var1000'))
                    );
            });

            it('loading with type conversion', () => {
                const dependency = helper('var4', {transformer: type.int});

                return expect(dependency.getValue())
                    .resolves
                    .toEqual(right(10));
            });

            it('loading array of strings', () => {
                const dependency = helper('var2');
                return expect(dependency.getValue())
                    .resolves
                    .toEqual(right(['foo', 'bar']));
            });

            it('uses custom dataLoader factory', () => {

                const spy = sinon.spy((batchFn: ssmProviderFactory.BatchFunction) => {
                    return new DataLoader(batchFn)
                });

                ssmProviderFactory({
                    ...CONFIG,
                    createDataLoader: spy,
                });

                sinon.assert.calledOnce(spy);
            });

            it('fails if dataloader has misconfigured maxBatchSize', async () => {
                const provider = ssmProviderFactory({
                    ...CONFIG,
                    createDataLoader: (batchFn: ssmProviderFactory.BatchFunction) => {
                        return new DataLoader(batchFn)
                    },
                });

                const result = await Promise.all(
                    ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k8', 'k10', 'k11', 'k12']
                        .map(x => {
                            return provider(x).getValue();
                        })
                );

                const finalResult = result.map(x => {
                    return x.fold(x => {
                        if (x instanceof Error) {
                            return x.message;
                        }
                    }, x => undefined);
                });

                expect(finalResult).toMatchSnapshot();
            })

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
                    .toEqual(right(1000));
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
                    ].map(right));
            })
        });
    });
});
