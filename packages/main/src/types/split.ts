function factory<T>(options: { transformer: (value: string) => T }): (value: string) => T[];
function factory(options?: Split.Options<string>): (value: string) => string[];
function factory<T>(options?: Split.Options<T>) {
    return (value: string) => {
        let tmpResult: any[] = (value || '').split(options?.separator ?? ',')
            .map(x => x.trim())
            .filter(x => x);

        if (options?.transformer) {
            tmpResult = tmpResult.map(options.transformer).filter(x => x)
        }
        return tmpResult;
    }
}

export const split = factory({separator: ','}) as Split;

split.by = factory;

export interface Split<T = string> {
    (value: string): T[];

    by: typeof factory;
}

export namespace Split {
    export interface Options<T = string> extends Partial<Options.Transformer<T>> {
        separator?: string;
    }

    export namespace Options {
        export interface Transformer<T> {
            transformer: (value: string) => T
        }
    }
}
