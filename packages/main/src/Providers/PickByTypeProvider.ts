import {Provider} from '../Provider';
import {Config} from '../Config';
import {runOnOptionalPromise} from '../common/runOnOptionalPromise';
import {ERRORS} from '../errors';
import {loadConfig} from '../common/loadConfig';
import {OptionalPromise} from '../utils';
import {Validation} from 'monet';

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

    getValue(): OptionalPromise<Provider.Value<T>> {
        return runOnOptionalPromise(
            this.getType(),
            type => {
                if (type.isFail()) {
                    return type as unknown as Provider.Value<T>;
                }

                return runOnOptionalPromise(
                    this.getOptionsForType(type.success()),
                    options => {
                        return options.map(x => {
                            return {
                                type: type.success(),
                                options: x
                            } as unknown as T;
                        })
                    }
                )
            }
        )
    }

    private getType(): OptionalPromise<Validation<Provider.Fail, string>> {
        return runOnOptionalPromise(
            this.typeProvider.getValue(),
            type => {
                return type.flatMap(type => {
                    if (!this.options.has(type)) {
                        return Validation.Fail(
                            ERRORS.PICK_PROVIDER_UNREGISTERED_TYPE.format(
                                type,
                                Array.from(this.options.keys()).join(', ')
                            )
                        )
                    }
                    return Validation.Success(type);
                });
            }
        );
    }

    private getOptionsForType(type: string): OptionalPromise<Provider.Value<any>> {
        const options = this.options.get(type)!;
        if (Provider.is(options)) {
            return options.getValue();
        }

        return loadConfig(options);
    }
}

export namespace PickByTypeProvider {
    export interface Value<TType extends string, TOptions> {
        type: TType;
        options: TOptions;
    }
}
