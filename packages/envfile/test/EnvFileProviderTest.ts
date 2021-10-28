import {EnvFileProvider} from '@src/EnvFileProvider';

describe('EnvFileProvider', () => {
    describe('availability', () => {
        it('is available if ENV exists and is not empty', () => {
            const provider = new EnvFileProvider('FOO', {FOO: 'test'});

            expect(provider.isAvailable())
                .toBe(true);
        });

        it('not available if ENV does not exist', () => {
            const provider = new EnvFileProvider('FOO', {});

            expect(provider.isAvailable())
                .toBe(false);
        });

        it('not available if ENV exists but is empty', () => {
            const provider = new EnvFileProvider('FOO', {FOO: ''});

            expect(provider.isAvailable())
                .toBe(false);
        });
    });

    it('description', () => {
        expect(new EnvFileProvider('FOO', {}).getDescription())
            .toMatchSnapshot();
    });

    it('getting value', () => {
        expect(new EnvFileProvider('FOO', {FOO: 'bar'}).getValue())
            .toEqual('bar');
    });
});
