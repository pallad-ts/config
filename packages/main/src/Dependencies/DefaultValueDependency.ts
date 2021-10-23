import {Dependency} from "../Dependency";
import * as is from 'predicates';
import {OptionalPromise} from '../utils';

export class DefaultValueDependency<T, TOriginal> extends Dependency<T | TOriginal> {
    constructor(private dependency: Dependency<TOriginal>, private defaultValue: T) {
        super();
    }

    getDescription(): string {
        return `${this.dependency.getDescription()} - default: ${this.defaultValue}`;
    }

    isAvailable() {
        return true;
    }

    protected retrieveValue(): OptionalPromise<T | TOriginal> {
        const isAvailable = this.dependency.isAvailable();

        if (is.promiseLike(isAvailable)) {
            return isAvailable.then(result => {
                if (result) {
                    return this.dependency.getValue();
                }
                return this.defaultValue;
            })
        }

        if (isAvailable) {
            return this.dependency.getValue();
        }
        return this.defaultValue;
    }

    static create<T, TOriginal>(dependency: Dependency<TOriginal>, defaultValue?: T) {
        if (defaultValue !== undefined) {
            return new DefaultValueDependency<T, TOriginal>(dependency, defaultValue);
        }
        return dependency;
    }
}
