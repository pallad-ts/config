import {Provider} from "../Provider";

export class FirstAvailableProvider<T> extends Provider<T> {
    private dependencies: Array<Provider<T>>;
    private cache?: Promise<Provider<T> | undefined>;

    constructor(...dependencies: Array<Provider<T>>) {
        super();
        this.dependencies = dependencies;
    }

    async isAvailable(): Promise<boolean> {
        const dep = await this.getFirstAvailableDependency();
        return !!dep;
    }

    private getFirstAvailableDependency() {
        if (this.cache) {
            return this.cache;
        }

        this.cache = (async () => {
            for (const dep of this.dependencies) {
                if (await dep.isAvailable()) {
                    return dep;
                }
            }
        })();
        return this.cache;
    }

    getDescription(): string {
        const desc = this.dependencies.map(x => x.getDescription()).join(', ');
        return `First available - ${desc}`;
    }

    async retrieveValue(): Promise<T> {
        return (await this.getFirstAvailableDependency())!.getValue();
    }
}