import {Dependency} from "../Dependency";

export class DefaultValueDependency<T> extends Dependency<T> {
    constructor(private dependency: Dependency<T>, private defaultValue: T) {
        super();
    }

    getDescription(): string {
        return `${this.dependency.getDescription()} - default: ${this.defaultValue}`;
    }

    async isAvailable() {
        return true;
    }

    protected async retrieveValue(): Promise<T> {
        const isAvailable = await this.dependency.isAvailable();

        if (isAvailable) {
            return this.dependency.getValue();
        }
        return this.defaultValue;
    }

    static create<T>(dependency: Dependency<T>, defaultValue?: T) {
        if (defaultValue !== undefined) {
            return new DefaultValueDependency(dependency, defaultValue);
        }
        return dependency;
    }
}