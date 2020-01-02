import {Dependency} from "../Dependency";

export class FirstAvailableDependency<T> extends Dependency<T> {
    private dependencies: Array<Dependency<T>>;
    private cache?: Promise<Dependency<T> | undefined>;

    constructor(...dependencies: Array<Dependency<T>>) {
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