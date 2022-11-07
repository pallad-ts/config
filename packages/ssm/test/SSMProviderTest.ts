import * as sinon from 'sinon';
import DataLoader = require("dataloader");
import {SSMProvider} from "@src/SSMProvider";
import {ValueNotAvailable} from '@pallad/config';
import {left, right} from "@sweet-monads/either";

describe('SSMProviderTest', () => {
    let dataLoader: sinon.SinonStubbedInstance<DataLoader<string, SSMProvider.Value | undefined>>;

    const KEY = 'foo';
    const RESULT = 'bar';

    function stubSSMResult(key: string, result: SSMProvider.Value | undefined) {
        dataLoader.load
            .withArgs(key)
            .resolves(result);
    }

    beforeEach(() => {
        dataLoader = sinon.createStubInstance(DataLoader);
    });

    it('not available if ssm key does not exist', () => {
        const provider = new SSMProvider(KEY, dataLoader);
        stubSSMResult(KEY, undefined);

        return expect(provider.getValue())
            .resolves
            .toEqual(left(new ValueNotAvailable(`SSM: ${KEY}`)));
    });

    it('success', () => {
        const provider = new SSMProvider(KEY, dataLoader);
        stubSSMResult(KEY, RESULT);

        return expect(provider.getValue())
            .resolves
            .toEqual(right(RESULT));
    });

    it('forwards error from dataloader', () => {
        const error = new Error('test');
        dataLoader.load
            .withArgs(KEY)
            .rejects(error);
        const provider = new SSMProvider(KEY, dataLoader);

        return expect(provider.getValue())
            .resolves
            .toEqual(left(error));
    });
});
