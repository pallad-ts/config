export abstract class Dependency<TType> {
    protected abstract retrieveValue(): Promise<any>;

    abstract getDescription(): string;

    abstract isAvailable(): Promise<boolean>;

    async getValue(): Promise<TType> {
        await this.assertAvailable();
        return this.retrieveValue();
    }

    private async assertAvailable() {
        const isAvailable = await this.isAvailable();
        if (!isAvailable) {
            throw new Error(`Config value not available: ${this.getDescription()}`);
        }
    }

    static is<T>(value: any): value is Dependency<T> {
        return value instanceof Dependency;
    }
}
