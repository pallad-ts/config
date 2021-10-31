import {Config} from '../Config';
import {OptionalPromise} from '../utils';
import {runOnOptionalPromise} from './runOnOptionalPromise';
import {extractProvidersFromConfig} from './extractProvidersFromConfig';
import {replaceProvidersInConfig} from './replaceProvidersInConfig';
import {Provider} from '../Provider';
import {isPromise} from './isPromise';
import {Validation} from 'monet';

/**
 * @internal
 */
export function loadConfig<T extends Config>(config: T): OptionalPromise<Validation<Provider.Fail, Config.Resolved<T>>> {
    return runOnOptionalPromise(
        resolveProviders(extractProvidersFromConfig(config)),
        resolved => {
            if (resolved.size === 0) {
                return Validation.Success(config);
            }

            const fails = Array.from(resolved.values())
                .reduce((result, entry) => {
                    if (entry.isFail()) {
                        const fail = entry.fail();
                        return result.concat(Array.isArray(fail) ? fail : [fail]);
                    }
                    return result;
                }, [] as Provider.Fail.Entry[]);

            if (fails.length) {
                return Validation.Fail(fails);
            }
            return Validation.Success(replaceProvidersInConfig(config, resolved));
        }
    );
}

function resolveProviders(providers: Array<Provider<any>>) {
    const resolvedProviders: Map<Provider<any>, Provider.Value<any>> = new Map();

    const resolvedValues = providers.map(
        provider => {
            return runOnOptionalPromise(
                provider.getValue(),
                value => {
                    return [provider, value];
                }
            )
        }
    );
    const hasPromise = resolvedValues.some(isPromise);

    return runOnOptionalPromise<Array<[Provider<any>, Provider.Value<any>]>, typeof resolvedProviders>(
        hasPromise ? Promise.all(resolvedValues) as any : resolvedValues,
        values => {
            for (const [provider, value] of values) {
                resolvedProviders.set(provider, value);
            }
            return resolvedProviders;
        }
    )
}
