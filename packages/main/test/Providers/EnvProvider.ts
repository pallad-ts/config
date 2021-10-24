import {EnvProvider} from "@src/Providers";

describe('ENVDependency', () => {
    describe('isAvailable', () => {
        describe('not available', () => {
            it('not defined', () => {
                const dependency = new EnvProvider('key', {key2: ''});
                return expect(dependency.isAvailable())
                    .resolves
                    .toEqual(false);
            });

            it('empty string', () => {
                const dependency = new EnvProvider('key', {key: ''});
                return expect(dependency.isAvailable())
                    .resolves
                    .toEqual(false);
            });
        });

        it('available', () => {
            const dependency = new EnvProvider('key', {key: 'test'});
            return expect(dependency.isAvailable())
                .resolves
                .toEqual(true);
        });
    });

    it('getting description', () => {
        const dependency = new EnvProvider('key');

        expect(dependency.getDescription())
            .toEqual('ENV: key');
    });

    describe('getting value', () => {
        it('not available', () => {
            const dependency = new EnvProvider('key', {});
            return expect(dependency.getValue())
                .rejects
                .toMatchSnapshot();
        });

        it('raw', () => {
            const value = 'bar';
            const dependency = new EnvProvider('key', {key: value});

            return expect(dependency.getValue())
                .resolves
                .toEqual(value);
        });
    });
});