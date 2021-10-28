import {Provider} from '../Provider';
import {extractProvidersFromConfig} from '../common/extractProvidersFromConfig';
import {Config} from '../Config';
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';
import {ERRORS} from '../errors';
import {isPromise} from '../common/isPromise';
import {loadConfig} from '../common/loadConfig';
import {OptionalPromise} from '../utils';

export class PickByTypeProvider<T> extends Provider<T> {
    private options = new Map<string, any>();

    private constructor(private typeProvider: Provider<string>) {
        super();
    }

    static create(typeDependency: Provider<string>) {
        return new PickByTypeProvider<undefined>(typeDependency);
    }

    registerOptions<TType extends string, TValue>(
        type: TType,
        value: TValue
    ): PickByTypeProvider<NonNullable<T> | PickByTypeProvider.Value<TType, Config.ResolvedValue<TValue>>> {
        if (this.options.has(type)) {
            throw ERRORS.PICK_PROVIDER_TYPE_ALREADY_EXISTS.format(type);
        }
        this.options.set(type, value);
        return this as any;
    }

    private getType(): OptionalPromise<string> {
        return runOnOptionalPromise(
            this.typeProvider.getValue(),
            resolvedType => {
                if (!this.options.has(resolvedType)) {
                    throw ERRORS.PICK_PROVIDER_UNREGISTERED_TYPE.format(
                        resolvedType,
                        Array.from(this.options.keys()).join(', ')
                    );
                }
                return resolvedType;
            }
        );
    }

    private getOptions() {
        return runOnOptionalPromise(this.getType(), type => this.options.get(type)!);
    }

    protected retrieveValue() {
        return runOnOptionalPromise(this.getType(), type => {
            return runOnOptionalPromise(this.getOptions(), options => {
                const finalOptions = Provider.is(options) ? options.getValue() : loadConfig(options);
                return runOnOptionalPromise(finalOptions, result => {
                    return {
                        type,
                        options: result
                    } as any as T;
                })
            });
        });
    }

    getDescription() {
        return `Pick by type from ${this.typeProvider.getDescription()}`;
    }

    private getDependentProviders() {
        return runOnOptionalPromise(
            this.getOptions(),
            options => {
                const optionsDependencies = Provider.is(options) ? [options] : extractProvidersFromConfig(options);
                return [
                    this.typeProvider,
                    ...optionsDependencies
                ];
            }
        );
    }

    isAvailable(): OptionalPromise<boolean> {
        return runOnOptionalPromise<boolean, OptionalPromise<boolean>>(
            this.typeProvider.isAvailable(),
            isTypeAvailable => {
                if (!isTypeAvailable) {
                    return false;
                }

                return runOnOptionalPromise(
                    this.getDependentProviders(),
                    dependentProviders => {
                        const iterator = dependentProviders[Symbol.iterator]();
                        for (const provider of iterator) {
                            const isAvailable = provider.isAvailable();
                            if (isPromise(isAvailable)) {
                                return isAvailable.then(result => {
                                    if (!result) {
                                        return false;
                                    }

                                    return (async () => {
                                        for (const provider of iterator) {
                                            const isAvailable = await provider.isAvailable();
                                            if (!isAvailable) {
                                                return false;
                                            }
                                        }
                                        return true;
                                    })();
                                })
                            } else if (!isAvailable) {
                                return false;
                            }
                        }
                        return true;
                    }
                )
            }
        );
    }
}

export namespace PickByTypeProvider {
    export interface Value<TType extends string, TOptions> {
        type: TType;
        options: TOptions;
    }
}
