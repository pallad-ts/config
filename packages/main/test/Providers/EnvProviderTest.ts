import {EnvProvider} from "@src/Providers";
import {assertNotAvailable} from '../common/assertNotAvailable';
import {assertProviderValue} from '../common/assertProviderValue';

describe('EnvProvider', () => {
    describe('getting value', () => {
        it('not available', () => {
            const provider = new EnvProvider('key', {});
            assertNotAvailable(false, provider.getValue(), 'ENV: key')
        });

        it('not available if value is empty', () => {
            const provider = new EnvProvider('key', {key: ''});
            assertNotAvailable(false, provider.getValue(), 'ENV: key')
        });

        it('returns value if provided', () => {
            const value = 'bar';
            const provider = new EnvProvider('key', {key: value});

            assertProviderValue(false, provider.getValue(), value);
        });

        it('by default takes value from process.env', () => {
            const key = 'PALLAD_CONFIG_TEST_KEY'
            const value = 'fooo';
            process.env[key] = value;

            const provider = new EnvProvider(key);
            assertProviderValue(false, provider.getValue(), value);
        });
    });
});
