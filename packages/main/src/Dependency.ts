import {OptionalPromise} from './utils';
import * as is from 'predicates';

export abstract class Dependency<TType> {
    protected abstract retrieveValue(): OptionalPromise<TType>;

    abstract getDescription(): string;

    abstract isAvailable(): OptionalPromise<boolean>;

    getValue(): OptionalPromise<TType> {
        const isAvailable = this.assertAvailable();

        if (is.promiseLike(isAvailable)) {
            return isAvailable.then(() => {
                return this.retrieveValue();
            })
        }
        return this.retrieveValue();
    }

    private assertAvailable() {
        const isAvailable = this.isAvailable();
        if (is.promiseLike(isAvailable)) {
            return isAvailable.then((result) => {
                if (!result) {
                    throw new Error(`Config value not available: ${this.getDescription()}`);
                }
            })
        } else {
            throw new Error(`Config value not available: ${this.getDescription()}`);
        }
    }

    static is<T>(value: any): value is Dependency<T> {
        return value instanceof Dependency;
    }
}
