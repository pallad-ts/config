import {Dependency} from '@src/Dependency';

export class DummyDependency<T> extends Dependency<T> {
    constructor(private data: {
        value: T,
        isAvailable?: boolean,
        description?: string
    }) {
        super();
    }

    getDescription(): string {
        return this.data.description || 'DummyDependency';
    }

    async isAvailable(): Promise<boolean> {
        return 'isAvailable' in this.data ? !!this.data.isAvailable : true;
    }

    protected async retrieveValue(): Promise<any> {
        return this.data.value;
    }
}
