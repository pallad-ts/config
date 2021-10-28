import * as sinon from 'sinon';
import DataLoader = require("dataloader");
import {SSMProvider} from "@src/SSMProvider";

describe('SSMProviderTest', () => {
    let dataLoader: sinon.SinonStubbedInstance<DataLoader<string, SSMProvider.Value | undefined>>;

    const KEY = 'foo';
    const RESULT = 'bar';

    function stubSSMResult(key: string, result: SSMProvider.Value) {
        dataLoader.load
            .withArgs(key)
            .resolves(result);
    }

    beforeEach(() => {
        dataLoader = sinon.createStubInstance(DataLoader);
    });

    describe('is available', () => {
        it('true if given ssm key exists', () => {
            const dep = new SSMProvider(KEY, dataLoader);
            stubSSMResult(KEY, RESULT);

            return expect(dep.isAvailable())
                .resolves
                .toEqual(true);
        });

        it('false if given ssm key does not exist', () => {
            const dep = new SSMProvider(KEY, dataLoader);
            return expect(dep.isAvailable())
                .resolves
                .toEqual(false);
        });
    });

    it('getting description', () => {
        const dep = new SSMProvider(KEY, dataLoader);
        expect(dep.getDescription())
            .toMatchSnapshot();
    });

    describe('getting value', () => {
        it('success', () => {
            const dep = new SSMProvider(KEY, dataLoader);
            stubSSMResult(KEY, RESULT);
            return expect(dep.getValue())
                .resolves
                .toEqual(RESULT);
        });

        it('failure', () => {
            const dep = new SSMProvider(KEY, dataLoader);

            return expect(dep.getValue())
                .rejects
                .toThrowErrorMatchingSnapshot()
        });
    });
});
