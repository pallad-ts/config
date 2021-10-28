import {EnvProvider} from "@src/Providers";

describe('EnvProvider', () => {
    describe('availability', () => {
        describe('not available', () => {
            it('if not defined', () => {
                const provider = new EnvProvider('key', {key2: ''});
                expect(provider.isAvailable())
                    .toEqual(false);
            });

            it('if empty string', () => {
                const provider = new EnvProvider('key', {key: ''});
                expect(provider.isAvailable())
                    .toEqual(false);
            });
        });

        it('if not and empty string', () => {
            const provider = new EnvProvider('key', {key: 'test'});
            expect(provider.isAvailable())
                .toEqual(true);
        });
    });

    it('getting description', () => {
        const provider = new EnvProvider('key');
        expect(provider.getDescription())
            .toEqual('ENV: key');
    });

    describe('getting value', () => {
        it('not available', () => {
            const provider = new EnvProvider('key', {});
            expect(() => {
                provider.getValue()
            })
                .toThrowErrorMatchingSnapshot();
        });

        it('raw', () => {
            const value = 'bar';
            const provider = new EnvProvider('key', {key: value});

            expect(provider.getValue())
                .toEqual(value);
        });
    });
});
