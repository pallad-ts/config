import { Either, left, right } from "@sweet-monads/either";

import { Provider } from "../Provider";
import { ResolvedConfig } from "../ResolvedConfig";
import { loadConfig } from "../common/loadConfig";
import { runOnOptionalPromise } from "../common/runOnOptionalPromise";
import { ERRORS } from "../errors";
import { OptionalPromise } from "../utils";

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
    ): PickByTypeProvider<NonNullable<T> | PickByTypeProvider.Value<TType, ResolvedConfig.Value<TValue>>> {
        if (this.options.has(type)) {
            throw ERRORS.PICK_PROVIDER_TYPE_ALREADY_EXISTS.create(type);
        }
        this.options.set(type, value);
        return this as any;
    }

    getValue(): OptionalPromise<Provider.Value<T>> {
        return runOnOptionalPromise(this.getType(), type => {
            if (type.isLeft()) {
                return type as unknown as Provider.Value<T>;
            }

            return runOnOptionalPromise(this.getOptionsForType(type.value), options => {
                return options.map(x => {
                    return {
                        type: type.value,
                        options: x,
                    } as unknown as T;
                });
            });
        });
    }

    private getType(): OptionalPromise<Provider.Value<string>> {
        return runOnOptionalPromise(this.typeProvider.getValue(), type => {
            return type.chain(type => {
                if (!this.options.has(type)) {
                    return left(ERRORS.PICK_PROVIDER_UNREGISTERED_TYPE.create(type, Array.from(this.options.keys())));
                }
                return right(type);
            });
        });
    }

    private getOptionsForType(type: string): OptionalPromise<Provider.Value<any>> {
        const options = this.options.get(type)!;
        if (Provider.isType(options)) {
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
