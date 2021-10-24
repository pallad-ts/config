import {ConfigError} from '../ConfigError';
import {Provider} from '../Provider';
import {extractProvidersFromConfig} from '../common/extractProvidersFromConfig';
import {Config} from '../Config';
import {load} from '../load';

export class PickByTypeProvider<T> extends Provider<T> {
    private options = new Map<string, any>();

    private resolvedType?: string;

    private constructor(private typeDependency: Provider<string>) {
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
            throw new ConfigError(`Type "${type}" already exists`);
        }
        this.options.set(type, value);
        return this as any;
    }

    private async getType() {
        if (this.resolvedType) {
            return this.resolvedType;
        }
        const type = this.resolvedType = await this.typeDependency.getValue();
        if (!this.options.has(type)) {
            throw new ConfigError(`Type "${type}" is not supported. Supported values: ${Array.from(this.options.keys()).join(', ')}`);
        }
        return type;
    }

    private async getOptions() {
        const type = await this.getType();
        return this.options.get(type)!;
    }

    protected async retrieveValue() {
        return {
            type: await this.getType(),
            options: await load(await this.getOptions())
        };
    }

    getDescription() {
        return `Pick by type from ${this.typeDependency.getDescription()}`;
    }

    private async getDependencies() {
        const options = await this.getOptions();

        const optionsDependencies = Provider.is(options) ? [options] : extractProvidersFromConfig(options);
        return [
            this.typeDependency,
            ...optionsDependencies
        ];
    }

    async isAvailable() {
        for (const dep of await this.getDependencies()) {
            const isAvailable = await dep.isAvailable();
            if (!isAvailable) {
                return false;
            }
        }
        return true;
    }
}

export namespace PickByTypeProvider {
    export interface Value<TType extends string, TOptions> {
        type: TType;
        options: TOptions;
    }
}
