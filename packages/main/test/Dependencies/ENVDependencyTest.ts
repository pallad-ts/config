import {ENVDependency} from "@src/Dependencies/ENVDependency";
import * as sinon from 'sinon';

describe('ENVDependency', () => {
    describe('isAvailable', () => {
        describe('not available', () => {
            it('not defined', () => {
                const dependency = new ENVDependency('key', undefined, {key2: ''});
                return expect(dependency.isAvailable())
                    .resolves
                    .toEqual(false);
            });

            it('empty string', () => {
                const dependency = new ENVDependency('key', undefined, {key: ''});
                return expect(dependency.isAvailable())
                    .resolves
                    .toEqual(false);
            });
        });

        it('available', () => {
            const dependency = new ENVDependency('key', undefined, {key: 'test'});
            return expect(dependency.isAvailable())
                .resolves
                .toEqual(true);
        });
    });

    it('getting description', () => {
        const dependency = new ENVDependency('key');

        expect(dependency.getDescription())
            .toEqual('ENV: key');
    });

    describe('getting value', () => {
        it('not available', () => {
            const dependency = new ENVDependency('key', undefined, {});
            return expect(dependency.getValue())
                .rejects
                .toMatchSnapshot();
        });

        it('transformed', () => {
            const value = 'bar';
            const envValue = 'foo';
            const transformer = sinon.stub()
                .withArgs(envValue)
                .returns(value);

            const dependency = new ENVDependency('key', transformer, {key: envValue});

            return expect(dependency.getValue())
                .resolves
                .toEqual(value);
        });

        it('raw', () => {
            const value = 'bar';
            const dependency = new ENVDependency('key', undefined, {key: value});

            return expect(dependency.getValue())
                .resolves
                .toEqual(value);
        });
    });
});