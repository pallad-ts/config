import {EnvFileProvider} from '@src/EnvFileProvider';
import {Validation} from 'monet';
import {ValueNotAvailable} from '@pallad/config';

describe('EnvFileProvider', () => {
    describe('not available', () => {

        it('if ENV does not exist', () => {
            const provider = new EnvFileProvider('FOO', {});

            expect(provider.getValue())
                .toStrictEqual(Validation.Fail(new ValueNotAvailable('"FOO" from ENV file(s)')));
        });

        it('if ENV exists but is empty', () => {
            const provider = new EnvFileProvider('FOO', {FOO: ''});

            expect(provider.getValue())
                .toStrictEqual(Validation.Fail(new ValueNotAvailable('"FOO" from ENV file(s)')));
        });
    });

    it('success', () => {
        expect(new EnvFileProvider('FOO', {FOO: 'bar'}).getValue())
            .toStrictEqual(Validation.Success('bar'));
    });
});
