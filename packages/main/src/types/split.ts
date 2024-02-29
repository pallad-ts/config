function factory<T>(separator: string = ",") {
    return (value: string) => {
        return (value || "")
            .split(separator)
            .map(x => x.trim())
            .filter(x => x);
    };
}

export const split = factory(",") as Split;

split.by = factory;

export interface Split<T = string> {
    (value: string): T[];

    by: typeof factory;
}

export namespace Split {}
