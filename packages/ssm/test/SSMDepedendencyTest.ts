import * as sinon from 'sinon';
import DataLoader = require("dataloader");
import {SSMDependency} from "@src/SSMDependency";

describe('SSMDependency', () => {
    let dataLoader: sinon.SinonStubbedInstance<DataLoader<string, SSMDependency.Value>>;

    const KEY = 'foo';
    const RESULT = 'bar';

    function stubSSMResult(key: string, result: SSMDependency.Value) {
        dataLoader.load
            .withArgs(key)
            .resolves(result);
    }

    beforeEach(() => {
        dataLoader = sinon.createStubInstance(DataLoader);
    });


    describe('is available', () => {
        it('true if given ssm key exists', () => {
            const dep = new SSMDependency(KEY, undefined, dataLoader);
            stubSSMResult(KEY, RESULT);

            return expect(dep.isAvailable())
                .resolves
                .toEqual(true);
        });

        it('false if given ssm key does not exist', () => {
            const dep = new SSMDependency(KEY, undefined, dataLoader);
            return expect(dep.isAvailable())
                .resolves
                .toEqual(false);
        });
    });

    it('getting description', () => {
        const dep = new SSMDependency(KEY, undefined, dataLoader);
        expect(dep.getDescription())
            .toMatchSnapshot();
    });

    describe('getting value', () => {
        it('success', () => {
            const dep = new SSMDependency(KEY, undefined, dataLoader);
            stubSSMResult(KEY, RESULT);
            return expect(dep.getValue())
                .resolves
                .toEqual(RESULT);
        });

        it('failure', () => {
            const dep = new SSMDependency(KEY, undefined, dataLoader);

            return expect(dep.getValue())
                .rejects
                .toThrowErrorMatchingSnapshot()
        });

        it('success with transformer', () => {
            const SSM_RESULT = 'world';

            const transformer = sinon.stub()
                .withArgs(SSM_RESULT)
                .returns(RESULT);

            const dep = new SSMDependency(KEY, transformer, dataLoader);
            stubSSMResult(KEY, SSM_RESULT);

            return expect(dep.getValue())
                .resolves
                .toEqual(RESULT);
        });
    });
});