import {createEnvOrSSMHelper, createSSMHelper, SSMHelper} from "@src/helper";
import {createEnvHelper, type} from '@pallad/config';
import * as sinon from 'sinon';
import DataLoader = require("dataloader");

describe('helper', () => {
    describe('ssm', () => {
        let helper: ReturnType<typeof createSSMHelper>;

        const CONFIG = {
            prefix: 'pallad-config-'
        };

        beforeEach(() => {
            helper = createSSMHelper({
                ...CONFIG
            });
        });

        describe('loading', () => {
            it('success', () => {
                const dependency = helper('var1');

                return expect(dependency.getValue())
                    .resolves
                    .toEqual('bar')
            });


            it('success with default value', () => {
                const dependency = helper('var100', {defaultValue: 'bar'});
                return expect(dependency.getValue())
                    .resolves
                    .toEqual('bar');
            });

            it('failure due to lack of parameter', () => {
                const dependency = helper('var1000');

                return expect(dependency.getValue())
                    .rejects
                    .toMatchSnapshot();
            });

            it('loading with type conversion', () => {
                const dependency = helper('var4', {transformer: type.int});

                return expect(dependency.getValue())
                    .resolves
                    .toEqual(10);
            });

            it('loading array of strings', () => {
                const dependency = helper('var2');
                return expect(dependency.getValue())
                    .resolves
                    .toEqual(['foo', 'bar']);
            });

            it('uses custom dataLoader factory', () => {

                const dataLoader = {};
                const stub = sinon.stub()
                    .resolves(dataLoader);

                createSSMHelper({
                    ...CONFIG,
                    createDataLoader: stub,
                });

                sinon.assert.calledOnce(stub);
            });

            it('using parameter deserializer', () => {
                const stub = sinon.stub()
                    .resolves(1000);

                const helper = createSSMHelper({
                    ...CONFIG,
                    parameterDeserializer: stub,
                });

                const dependency = helper('var1');

                return expect(dependency.getValue())
                    .resolves
                    .toEqual(1000);
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
                    ]);
            })
        });
    });

    describe('envOrSSM', () => {
        let helper: ReturnType<typeof createEnvOrSSMHelper>;

        const ENVS = {
            var1: 'foo',
        };
        const CONFIG: SSMHelper.EnvOrOptions = {
            prefix: 'pallad-config-',
            envHelper: createEnvHelper(ENVS)
        };

        beforeEach(() => {
            helper = createEnvOrSSMHelper({
                ...CONFIG
            });
        });

        it('takes env variable since it is defined', () => {
            const dependency = helper('var1');

            return expect(dependency.getValue())
                .resolves
                .toEqual('foo');
        });

        it('takes ssm value since env is not defined', () => {
            const dependency = helper('var2');

            return expect(dependency.getValue())
                .resolves
                .toEqual(['foo', 'bar']);
        });

        it('takes ssm value under different name since env is not defined', () => {
            const dependency = helper('var2', {
                ssmName: 'var3'
            });
            return expect(dependency.getValue())
                .resolves
                .toEqual('world');
        });
    });
});